import json
from datetime import date, datetime, timedelta
from email.mime.image import MIMEImage
from pathlib import Path
from typing import Optional
from urllib.parse import quote, urljoin

import jsonpath_ng
import sequences
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.db.models import Q
from django.template.loader import get_template
from django.urls import reverse
from django.utils import timezone, translation
from django.utils.translation import gettext, gettext_lazy as _
from encrypted_fields.fields import EncryptedCharField, SearchField
from localflavor.generic.models import IBANField
from requests.exceptions import ReadTimeout

from applications.api.v1.validators import validate_additional_info_user_reasons
from applications.enums import (
    APPLICATION_LANGUAGE_CHOICES,
    ATTACHMENT_CONTENT_TYPE_CHOICES,
    AttachmentType,
    EmployerApplicationStatus,
    HiredWithoutVoucherAssessment,
    SummerVoucherExceptionReason,
    VtjTestCase,
    YouthApplicationStatus,
)
from applications.tests.data.mock_vtj import (
    mock_vtj_person_id_query_found_content,
    mock_vtj_person_id_query_not_found_content,
)
from common.permissions import HandlerPermission
from common.urls import handler_youth_application_processing_url
from common.utils import (
    are_same_text_lists,
    are_same_texts,
    send_mail_with_error_logging,
    validate_finnish_social_security_number,
)
from companies.models import Company
from shared.common.utils import MatchesAnyOfQuerySet, social_security_number_birthdate
from shared.common.validators import (
    validate_json,
    validate_name,
    validate_optional_json,
    validate_phone_number,
    validate_postcode,
)
from shared.models.abstract_models import HistoricalModel, TimeStampedModel, UUIDModel
from shared.models.mixins import LockForUpdateMixin
from shared.vtj.vtj_client import VTJClient


class School(TimeStampedModel, UUIDModel):
    """
    List of active schools.
    """

    name = models.CharField(
        max_length=256, unique=True, db_index=True, validators=[validate_name]
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("school")
        verbose_name_plural = _("schools")
        ordering = ["name"]


class YouthApplicationQuerySet(MatchesAnyOfQuerySet, models.QuerySet):
    def _active_q_filter(self) -> Q:
        """
        Return Q filter for active youth applications
        """
        return Q(receipt_confirmed_at__isnull=False)

    def _unexpired_q_filter(self) -> Q:
        """
        Return Q filter for unexpired youth applications.
        """
        return Q(created_at__gt=timezone.now() - YouthApplication.expiration_duration())

    def matches_email_or_social_security_number(self, email, social_security_number):
        """
        Return youth applications that match given email or social security number
        """
        return self.matches_any_of(
            email=email, social_security_number=social_security_number
        )

    def expired(self):
        """
        Return youth applications that are expired
        """
        return self.filter(~self._unexpired_q_filter())

    def unexpired(self):
        """
        Return youth applications that are unexpired
        """
        return self.filter(self._unexpired_q_filter())

    def unexpired_or_active(self):
        """
        Return youth applications that are unexpired or active
        """
        return self.filter(self._unexpired_q_filter() | self._active_q_filter())

    def active(self):
        """
        Return active youth applications
        """
        return self.filter(self._active_q_filter())

    def non_rejected(self):
        """
        Return non-rejected youth applications
        """
        return self.exclude(status=YouthApplicationStatus.REJECTED.value)


class YouthApplication(LockForUpdateMixin, TimeStampedModel, UUIDModel):
    first_name = models.CharField(
        max_length=128,
        verbose_name=_("first name"),
        validators=[validate_name],
    )
    last_name = models.CharField(
        max_length=128,
        verbose_name=_("last name"),
        validators=[validate_name],
    )
    encrypted_social_security_number = EncryptedCharField(
        max_length=11,
        verbose_name=_("social security number"),
    )
    social_security_number = SearchField(
        hash_key=settings.SOCIAL_SECURITY_NUMBER_HASH_KEY,
        encrypted_field_name="encrypted_social_security_number",
        validators=[validate_finnish_social_security_number],
    )
    school = models.CharField(
        max_length=256,
        verbose_name=_("school"),
        validators=[validate_name],
    )
    is_unlisted_school = models.BooleanField()
    email = models.EmailField(
        verbose_name=_("email"),
    )
    phone_number = models.CharField(
        max_length=64,
        verbose_name=_("phone number"),
        validators=[validate_phone_number],
    )
    postcode = models.CharField(
        max_length=5,
        verbose_name=_("postcode"),
        validators=[validate_postcode],
    )
    language = models.CharField(
        choices=APPLICATION_LANGUAGE_CHOICES,
        default=APPLICATION_LANGUAGE_CHOICES[0][0],  # fi
        max_length=2,
    )
    receipt_confirmed_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_("timestamp of receipt confirmation")
    )
    encrypted_original_vtj_json = EncryptedCharField(
        null=True,
        blank=True,
        max_length=1024 * 1024,
        verbose_name=_("original vtj json"),
        help_text=_("VTJ JSON used for automatic processing of new youth application"),
        validators=[validate_optional_json],
    )
    encrypted_handler_vtj_json = EncryptedCharField(
        null=True,
        blank=True,
        max_length=1024 * 1024,
        verbose_name=_("handler vtj json"),
        help_text=_("VTJ JSON used for accepting/rejecting by human or machine"),
        validators=[validate_optional_json],
    )
    status = models.CharField(
        max_length=64,
        verbose_name=_("status"),
        choices=YouthApplicationStatus.choices,
        default=YouthApplicationStatus.SUBMITTED,
    )
    handler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="youth_applications",
        verbose_name=_("handler"),
        blank=True,
        null=True,
    )
    handled_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_("time handled")
    )
    additional_info_provided_at = models.DateTimeField(
        null=True, blank=True, verbose_name=_("time additional info was provided")
    )
    additional_info_user_reasons = models.JSONField(
        blank=True,  # Allow empty list i.e. []
        default=list,
        verbose_name=_("additional info user reasons"),
        validators=[validate_additional_info_user_reasons],
    )
    additional_info_description = models.CharField(
        blank=True,
        default="",
        max_length=4096,
        verbose_name=_("additional info description"),
    )
    objects = YouthApplicationQuerySet.as_manager()

    @property
    def is_vtj_test_case(self) -> bool:
        return (
            are_same_texts(self.first_name, VtjTestCase.first_name())
            and self.vtj_test_case
        )

    @property
    def vtj_test_case(self) -> str:
        """
        If last name is found in VtjTestCase.values then return it, otherwise return "".
        """
        for vtj_test_case in VtjTestCase.values:
            if are_same_texts(self.last_name, vtj_test_case):
                return vtj_test_case
        return ""

    @staticmethod
    def get_mocked_vtj_json_for_vtj_test_case(
        vtj_test_case, first_name, last_name, social_security_number
    ):
        if vtj_test_case == VtjTestCase.NOT_FOUND.value:
            return mock_vtj_person_id_query_not_found_content()
        elif vtj_test_case == VtjTestCase.NO_ANSWER.value:
            return None
        else:
            return mock_vtj_person_id_query_found_content(
                first_name=first_name,
                last_name=(
                    "VTJ-palvelun palauttama eri sukunimi"
                    if vtj_test_case == VtjTestCase.WRONG_LAST_NAME.value
                    else last_name
                ),
                social_security_number=social_security_number,
                is_alive=vtj_test_case != VtjTestCase.DEAD.value,
                is_home_municipality_helsinki=(
                    vtj_test_case == VtjTestCase.HOME_MUNICIPALITY_HELSINKI.value
                ),
            )

    def fetch_vtj_json(self, end_user: str):
        if settings.NEXT_PUBLIC_DISABLE_VTJ:
            # Not fetching data because VTJ integration is disabled and not mocked
            return None
        elif settings.NEXT_PUBLIC_MOCK_FLAG:
            # VTJ integration enabled and mocked
            if self.is_vtj_test_case:
                if self.vtj_test_case == VtjTestCase.NO_ANSWER.value:
                    raise ReadTimeout()
                else:
                    return YouthApplication.get_mocked_vtj_json_for_vtj_test_case(
                        vtj_test_case=self.vtj_test_case,
                        first_name=self.first_name,
                        last_name=self.last_name,
                        social_security_number=self.social_security_number,
                    )
            else:
                return mock_vtj_person_id_query_not_found_content()
        else:
            # VTJ integration is enabled and not mocked
            return json.dumps(
                VTJClient().get_personal_info(self.social_security_number, end_user)
            )

    def _vtj_values(self, jsonpath_expression) -> list:
        try:
            vtj_json = json.loads(self.encrypted_original_vtj_json)
        except (json.decoder.JSONDecodeError, TypeError):
            return []

        return [
            match.value
            for match in jsonpath_ng.parse(jsonpath_expression).find(vtj_json)
        ]

    def handler_processing_url(self):
        return handler_youth_application_processing_url(self.pk)

    def _localized_frontend_page_url(self, page_name, id_query_param=None):
        result = urljoin(
            settings.YOUTH_URL, f"/{quote(self.language)}/{quote(page_name)}"
        )
        if id_query_param is not None:
            result += f"?id={quote(str(id_query_param))}"
        return result

    def additional_info_page_url(self, pk):
        return self._localized_frontend_page_url("additional_info", id_query_param=pk)

    def activated_page_url(self):
        return self._localized_frontend_page_url("activated")

    def accepted_page_url(self):
        return self._localized_frontend_page_url("accepted")

    def expired_page_url(self):
        return self._localized_frontend_page_url("expired")

    def already_activated_page_url(self):
        return self._localized_frontend_page_url("already_activated")

    def _activation_link(self, request):
        return request.build_absolute_uri(
            reverse("v1:youthapplication-activate", kwargs={"pk": self.id})
        )

    def _processing_link(self, request):
        return request.build_absolute_uri(
            reverse("v1:youthapplication-process", kwargs={"pk": self.id})
        )

    @staticmethod
    def expiration_duration() -> timedelta:
        return timedelta(
            seconds=settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS
        )

    @property
    def seconds_elapsed(self) -> int:
        return int((timezone.now() - self.created_at) / timedelta(seconds=1))

    @property
    def has_activation_link_expired(self) -> bool:
        return (
            self.seconds_elapsed
            >= settings.NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS
        )

    @staticmethod
    def activation_email_subject(language):
        with translation.override(language):
            return gettext("Aktivoi Kesäseteli")

    @staticmethod
    def _activation_email_message(language, activation_link):
        with translation.override(language):
            return gettext(
                "Aktivoi Kesäsetelisi vahvistamalla sähköpostiosoitteesi "
                "klikkaamalla alla olevaa linkkiä:\n\n"
                "%(activation_link)s\n\n"
                "Ystävällisin terveisin, Kesäseteli-tiimi"
            ) % {"activation_link": activation_link}

    @staticmethod
    def additional_info_request_email_subject(language):
        with translation.override(language):
            return gettext("Lisätietopyyntö")

    @staticmethod
    def _additional_info_request_email_message(language, activation_link):
        with translation.override(language):
            return gettext(
                "Täydennäthän kesäsetelihakemuksesi tietoja alla olevasta linkistä:\n\n"
                "%(activation_link)s\n\n"
                "Kiitos! Ystävällisin terveisin, Kesäseteli-tiimi"
            ) % {"activation_link": activation_link}

    def processing_email_subject(self):
        with translation.override("fi"):
            return gettext("Nuoren kesäsetelihakemus: %(first_name)s %(last_name)s") % {
                "first_name": self.first_name,
                "last_name": self.last_name,
            }

    def _processing_email_message(self, processing_link):
        with translation.override("fi"):
            return gettext(
                "Seuraava henkilö on pyytänyt Kesäseteliä:\n"
                "\n"
                "%(first_name)s %(last_name)s\n"
                "Postinumero: %(postcode)s\n"
                "Koulu: %(school)s\n"
                "Puhelinnumero: %(phone_number)s\n"
                "Sähköposti: %(email)s\n"
                "\n"
                "%(processing_link)s"
            ) % {
                "first_name": self.first_name,
                "last_name": self.last_name,
                "postcode": self.postcode,
                "school": self.school,
                "phone_number": self.phone_number,
                "email": self.email,
                "processing_link": processing_link,
            }

    def send_additional_info_request_email(self, request, language) -> bool:
        """
        Send youth application's additional info request email with given language to
        the applicant.

        :param request: Request used for generating the activation link
        :param language: The language to be used in the email
        :return: True if email was sent, otherwise False.
        """
        return send_mail_with_error_logging(
            subject=YouthApplication.additional_info_request_email_subject(language),
            message=YouthApplication._additional_info_request_email_message(
                language=language,
                activation_link=self._activation_link(request),
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.email],
            error_message=_(
                "Unable to send youth application's additional info request email"
            ),
        )

    def send_activation_email(self, request, language) -> bool:
        """
        Send youth application's activation email with given language to the applicant.

        :param request: Request used for generating the activation link
        :param language: The activation email language to be used
        :return: True if email was sent, otherwise False.
        """
        return send_mail_with_error_logging(
            subject=YouthApplication.activation_email_subject(language),
            message=YouthApplication._activation_email_message(
                language=language,
                activation_link=self._activation_link(request),
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.email],
            error_message=_("Unable to send youth application's activation email"),
        )

    def send_processing_email_to_handler(self, request) -> bool:
        """
        Send youth application's manual processing email to the handler.

        :param request: Request used for generating the processing link
        :return: True if email was sent, otherwise False.
        """
        return send_mail_with_error_logging(
            subject=self.processing_email_subject(),
            message=self._processing_email_message(self._processing_link(request)),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.HANDLER_EMAIL],
            error_message=_(
                "Unable to send youth application's processing email to handler"
            ),
        )

    @property
    def is_active(self) -> bool:
        return self.receipt_confirmed_at is not None

    @property
    def can_activate(self) -> bool:
        return not self.is_active and not self.has_activation_link_expired

    @transaction.atomic
    def activate(self) -> bool:
        """
        Activate this youth application if possible.

        :return: self.is_active
        """
        if self.can_activate:
            self.receipt_confirmed_at = timezone.now()
            self.save()
        return self.is_active

    def _set_handler(self, handler, automatic_handling):
        try:
            self.handler = handler
        except ValueError:  # e.g. cannot assign AnonymousUser: Must be a User instance
            self.handler = None
        if self.handler is None:
            if not (automatic_handling or HandlerPermission.allow_empty_handler()):
                raise ValueError("Forbidden empty handler")

    @transaction.atomic
    def _handle(
        self,
        status: YouthApplicationStatus,
        handler,
        encrypted_handler_vtj_json,
        automatic_handling,
    ):
        """
        Handle the youth application by setting the status, encrypted_handler_vtj_json,
        handler and handled_at.

        :param status: The target status
        :type status: YouthApplicationStatus
        :param encrypted_handler_vtj_json: The VTJ JSON the handler used for handling
        :type encrypted_handler_vtj_json: str
        :param handler: Handler user
        :type handler: None | AnonymousUser | User
        """
        if status not in YouthApplicationStatus.handled_values():
            raise ValueError(f"Invalid handle status: {status}")
        self.status = status
        self._set_handler(handler, automatic_handling)
        self.encrypted_handler_vtj_json = encrypted_handler_vtj_json
        self.handled_at = timezone.now()
        self.save()

    @property
    def has_youth_summer_voucher(self) -> bool:
        try:
            self.youth_summer_voucher
        except ObjectDoesNotExist:
            return False
        return True

    @transaction.atomic  # Needed for django-sequences serial number handling
    def create_youth_summer_voucher(self) -> "YouthSummerVoucher":
        return YouthSummerVoucher.objects.create(
            youth_application=self,
            summer_voucher_serial_number=YouthSummerVoucher.get_next_serial_number(),
        )

    @property
    def is_handled(self) -> bool:
        return self.status in YouthApplicationStatus.handled_values()

    @property
    def is_accepted(self) -> bool:
        return self.status == YouthApplicationStatus.ACCEPTED

    def can_accept_manually(self, handler, encrypted_handler_vtj_json) -> bool:
        return (
            self.status in YouthApplicationStatus.acceptable_values()
            and HandlerPermission.has_user_permission(handler)
            and (
                settings.NEXT_PUBLIC_DISABLE_VTJ
                or self.is_valid_encrypted_handler_vtj_json(encrypted_handler_vtj_json)
            )
            and not self.has_youth_summer_voucher
        )

    @transaction.atomic
    def accept_automatically(self) -> bool:
        """
        Accept this youth application automatically without handler if possible.
        Create related YouthSummerVoucher if changed to accepted.

        :return: self.is_accepted
        """
        if self.can_accept_automatically:
            self._handle(
                status=YouthApplicationStatus.ACCEPTED,
                handler=None,
                encrypted_handler_vtj_json=self.encrypted_original_vtj_json,
                automatic_handling=True,
            )
            self.create_youth_summer_voucher()
        return self.is_accepted

    @classmethod
    def is_valid_encrypted_handler_vtj_json(cls, encrypted_handler_vtj_json):
        try:
            validate_json(encrypted_handler_vtj_json)
        except ValidationError:
            return False
        vtj_json_dict = json.loads(encrypted_handler_vtj_json)
        return "@xmlns" in vtj_json_dict and "vtjkysely" in vtj_json_dict["@xmlns"]

    @transaction.atomic
    def accept_manually(self, handler, encrypted_handler_vtj_json) -> bool:
        """
        Accept this youth application manually using given handler user and handler VTJ
        JSON if possible. Create related YouthSummerVoucher if changed to accepted.

        :return: self.is_accepted
        """
        if self.can_accept_manually(
            handler=handler, encrypted_handler_vtj_json=encrypted_handler_vtj_json
        ):
            self._handle(
                status=YouthApplicationStatus.ACCEPTED,
                handler=handler,
                encrypted_handler_vtj_json=encrypted_handler_vtj_json,
                automatic_handling=False,
            )
            self.create_youth_summer_voucher()
        return self.is_accepted

    @property
    def is_rejected(self) -> bool:
        return self.status == YouthApplicationStatus.REJECTED

    def can_reject(self, handler, encrypted_handler_vtj_json) -> bool:
        return (
            self.status in YouthApplicationStatus.rejectable_values()
            and HandlerPermission.has_user_permission(handler)
            and (
                settings.NEXT_PUBLIC_DISABLE_VTJ
                or self.is_valid_encrypted_handler_vtj_json(encrypted_handler_vtj_json)
            )
        )

    @transaction.atomic
    def reject(self, handler, encrypted_handler_vtj_json) -> bool:
        """
        Reject youth application using given handler user and handler VTJ JSON if
        possible.

        :return: self.is_rejected
        """
        if self.can_reject(
            handler=handler, encrypted_handler_vtj_json=encrypted_handler_vtj_json
        ):
            self._handle(
                status=YouthApplicationStatus.REJECTED,
                handler=handler,
                encrypted_handler_vtj_json=encrypted_handler_vtj_json,
                automatic_handling=False,
            )
        return self.is_rejected

    @property
    def birthdate(self) -> date:
        """
        Applicant's birthdate based on their social security number.
        """
        return social_security_number_birthdate(self.social_security_number)

    @property
    def is_9th_grader_age(self) -> bool:
        """
        If applicant's age correct for a ninth grader ("9. luokkalainen" in Finnish)?
        """
        return (self.created_at.year - self.birthdate.year) == 16  # e.g. 2022 - 2006

    @property
    def is_upper_secondary_education_1st_year_student_age(self) -> bool:
        """
        If applicant's age correct for an upper secondary education first year student
        ("Toisen asteen ensimmäisen vuoden opiskelija" in Finnish)?
        """
        return (self.created_at.year - self.birthdate.year) == 17  # e.g. 2022 - 2005

    @property
    def is_social_security_number_valid_according_to_vtj(self) -> bool:
        return are_same_text_lists(
            self._vtj_values("$.Henkilo.Henkilotunnus.['@voimassaolokoodi', '#text']"),
            ["1", self.social_security_number],
        )

    @property
    def is_applicant_dead_according_to_vtj(self) -> bool:
        return "1" in self._vtj_values("$.Henkilo.Kuolintiedot.Kuollut") or (
            len(self._vtj_values("$.Henkilo.Kuolintiedot.Kuolinpvm")) > 0
            and set(self._vtj_values("$.Henkilo.Kuolintiedot.Kuolinpvm")) != {None}
        )

    @property
    def vtj_last_name(self):
        if vtj_last_names := self._vtj_values("$.Henkilo.NykyinenSukunimi.Sukunimi"):
            return vtj_last_names[0]
        return None

    @property
    def attends_helsinkian_school(self) -> bool:
        return not self.is_unlisted_school

    @property
    def vtj_home_municipality(self):
        if vtj_home_municipality := self._vtj_values("$.Henkilo.Kotikunta.KuntaS"):
            return vtj_home_municipality[0]
        return ""

    @property
    def is_helsinkian(self) -> bool:
        return are_same_texts(self.vtj_home_municipality, "Helsinki")

    @property
    def is_last_name_as_in_vtj(self) -> bool:
        return are_same_texts(self.last_name, self.vtj_last_name)

    @property
    def is_applicant_in_target_group(self) -> bool:
        if self.is_9th_grader_age:
            return self.is_helsinkian or self.attends_helsinkian_school
        elif self.is_upper_secondary_education_1st_year_student_age:
            return self.is_helsinkian
        return False

    @property
    def can_accept_automatically(self) -> bool:
        return (
            self.is_active
            and not self.is_handled
            and not self.need_additional_info
            and not self.has_youth_summer_voucher
        )

    @property
    def need_additional_info(self) -> bool:
        """
        Does the youth application initially need additional info to be processed?

        :return: True if youth application initially needs additional info be processed,
                 otherwise False. Note that this value does NOT change based on whether
                 additional info has been provided or not.
        """
        if settings.NEXT_PUBLIC_DISABLE_VTJ:
            return not (self.is_9th_grader_age and self.attends_helsinkian_school)

        return (
            self.is_applicant_dead_according_to_vtj
            or not self.is_social_security_number_valid_according_to_vtj
            or not self.is_last_name_as_in_vtj
            or not self.is_applicant_in_target_group
        )

    @property
    def has_additional_info(self) -> bool:
        """
        Has additional info been provided for this youth application?

        :return: True if additional info has been provided, otherwise False.
        """
        return self.additional_info_provided_at is not None

    @property
    def can_set_additional_info(self) -> bool:
        """
        Can additional info be set for this youth application?

        :return: True if status is
                 YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED, otherwise
                 False.
        """
        return self.status == YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED

    def set_additional_info(
        self, additional_info_user_reasons, additional_info_description
    ):
        """
        Sets additional_info_user_reasons and additional_info_description to given
        values, status to YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        additional_info_provided_at to current time and saves the youth application.
        """
        self.additional_info_provided_at = timezone.now()
        self.additional_info_user_reasons = additional_info_user_reasons
        self.additional_info_description = additional_info_description
        self.status = YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
        self.save()

    @classmethod
    def is_email_or_social_security_number_active(
        cls, email, social_security_number
    ) -> bool:
        """
        Is there an active non-rejected youth application created that uses the same
        email or social security number as this youth application?

        :return: True if this youth application's email or social security number are
                 used by at least one active non-rejected youth application, otherwise
                 False.
        """
        return (
            cls.objects.matches_email_or_social_security_number(
                email, social_security_number
            )
            .active()
            .non_rejected()
            .exists()
        )

    @classmethod
    def is_email_used(cls, email) -> bool:
        """
        Is this youth application's email used by unexpired or active youth application
        which has not been rejected?

        :return: True if this youth application's email is used by at least one
                 unexpired or active youth application which has not been rejected,
                 otherwise False.
        """
        return (
            cls.objects.filter(email=email)
            .unexpired_or_active()
            .non_rejected()
            .exists()
        )

    @property
    def name(self):
        return f"{self.first_name.strip()} {self.last_name.strip()}".strip()

    def __str__(self):
        return f"{self.created_at}: {self.name} ({self.email})"

    class Meta:
        verbose_name = _("youth application")
        verbose_name_plural = _("youth applications")
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["receipt_confirmed_at"]),
            models.Index(fields=["social_security_number"]),
        ]
        ordering = ["-created_at"]


class YouthSummerVoucher(HistoricalModel, TimeStampedModel, UUIDModel):
    youth_application = models.OneToOneField(
        YouthApplication,
        on_delete=models.CASCADE,
        related_name="youth_summer_voucher",
        verbose_name=_("youth application"),
    )
    summer_voucher_serial_number = models.PositiveBigIntegerField(
        unique=True,
        validators=[MinValueValidator(1)],
        verbose_name=_("summer voucher id"),
    )
    summer_voucher_exception_reason = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("summer voucher exception class"),
        help_text=_("Special case of admitting the summer voucher."),
        choices=SummerVoucherExceptionReason.choices,
    )

    @staticmethod
    def get_next_serial_number() -> int:
        return sequences.get_next_value(
            sequence_name="youth_summer_voucher_serial_numbers",
            initial_value=1,
        )

    @property
    def year(self) -> int:
        return self.youth_application.created_at.year

    def email_subject(self, language):
        with translation.override(language):
            return gettext("Vuoden %(year)s Kesäsetelisi") % {"year": self.year}

    @staticmethod
    def _template_image(filename, content_id) -> MIMEImage:
        source_folder = Path(__file__).resolve().parent / "templates" / "images"
        with open(source_folder / filename, "rb") as file:
            data = file.read()
            image = MIMEImage(data)
            image.add_header("Content-ID", f"<{content_id}>")
            return image

    def youth_summer_voucher_logo(self, language) -> MIMEImage:
        return YouthSummerVoucher._template_image(
            filename=f"youth_summer_voucher-325e-{language}.png",
            content_id="youth_summer_voucher_logo",
        )

    def helsinki_logo(self) -> MIMEImage:
        return YouthSummerVoucher._template_image(
            filename="helsinki.png",
            content_id="helsinki_logo",
        )

    def send_youth_summer_voucher_email(
        self, language, send_to_youth=True, send_to_handler=True
    ) -> bool:
        """
        Send youth summer voucher email with given language to the applicant.

        :param language: The language to be used in the email
        :param send_to_youth: Send the voucher to youth's email
        :param send_to_handler: Send a copy of the voucher to the handler email
        :return: True if email was sent, otherwise False.
        """
        recipient_list = [self.youth_application.email] if send_to_youth else None
        bcc = [settings.HANDLER_EMAIL] if send_to_handler else None

        if not (recipient_list or bcc):
            return False

        with translation.override(language):
            context = {
                "first_name": self.youth_application.first_name,
                "last_name": self.youth_application.last_name,
                "summer_voucher_serial_number": self.summer_voucher_serial_number,
                "postcode": self.youth_application.postcode,
                "school": self.youth_application.school,
                "phone_number": self.youth_application.phone_number,
                "email": self.youth_application.email,
                "year": self.year,
            }
            return send_mail_with_error_logging(
                subject=self.email_subject(language),
                message=get_template("youth_summer_voucher_email.txt").render(context),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                bcc=bcc,
                error_message=_("Unable to send youth summer voucher email"),
                html_message=get_template("youth_summer_voucher_email.html").render(
                    context
                ),
                images=[
                    self.helsinki_logo(),
                    self.youth_summer_voucher_logo(language=language),
                ],
            )

    class Meta:
        verbose_name = _("youth summer voucher")
        verbose_name_plural = _("youth summer vouchers")
        ordering = ["summer_voucher_serial_number"]


class EmployerApplication(HistoricalModel, TimeStampedModel, UUIDModel):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="employer_applications",
        verbose_name=_("company"),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employer_applications",
        verbose_name=_("user"),
    )
    status = models.CharField(
        max_length=64,
        verbose_name=_("status"),
        choices=EmployerApplicationStatus.choices,
        default=EmployerApplicationStatus.DRAFT,
    )
    street_address = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("invoicer work address"),
    )
    bank_account_number = IBANField(
        verbose_name=_("bank account number"),
        blank=True,
    )

    # contact information
    contact_person_name = models.CharField(
        blank=True,
        max_length=256,
        verbose_name=_("contact person name"),
    )
    contact_person_email = models.EmailField(
        blank=True, verbose_name=_("contact person email")
    )
    contact_person_phone_number = models.CharField(
        max_length=64,
        blank=True,
        verbose_name=_("contact person phone number"),
    )

    # invoicer information
    is_separate_invoicer = models.BooleanField(
        default=False,
        verbose_name=_("is separate invoicer"),
        help_text=_("invoicing is not handled by the contact person"),
    )
    invoicer_name = models.CharField(
        blank=True,
        max_length=256,
        verbose_name=_("invoicer name"),
    )
    invoicer_email = models.EmailField(blank=True, verbose_name=_("invoicer email"))
    invoicer_phone_number = models.CharField(
        max_length=64,
        blank=True,
        verbose_name=_("invoicer phone number"),
    )
    language = models.CharField(
        choices=APPLICATION_LANGUAGE_CHOICES,
        default=APPLICATION_LANGUAGE_CHOICES[0][0],  # fi
        max_length=2,
    )

    class Meta:
        verbose_name = _("application")
        verbose_name_plural = _("applications")
        ordering = ["-created_at"]


class EmployerSummerVoucher(HistoricalModel, TimeStampedModel, UUIDModel):
    application = models.ForeignKey(
        EmployerApplication,
        on_delete=models.CASCADE,
        related_name="summer_vouchers",
        verbose_name=_("application"),
    )
    summer_voucher_serial_number = models.CharField(
        max_length=256, blank=True, verbose_name=_("summer voucher id")
    )
    summer_voucher_exception_reason = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("summer voucher exception class"),
        help_text=_("Special case of admitting the summer voucher."),
        choices=SummerVoucherExceptionReason.choices,
    )

    employee_name = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("employee name"),
    )
    employee_school = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("employee school"),
    )
    employee_ssn = EncryptedCharField(
        max_length=32,
        blank=True,
        verbose_name=_("employee social security number"),
    )
    employee_phone_number = models.CharField(
        max_length=64,
        blank=True,
        verbose_name=_("employee phone number"),
    )
    employee_home_city = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("employee home city"),
    )
    employee_postcode = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("employee postcode"),
    )

    employment_postcode = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("employment postcode"),
    )
    employment_start_date = models.DateField(
        verbose_name=_("employment start date"), null=True, blank=True
    )
    employment_end_date = models.DateField(
        verbose_name=_("employment end date"), null=True, blank=True
    )
    employment_work_hours = models.DecimalField(
        verbose_name=_("employment work hours"),
        decimal_places=2,
        max_digits=8,
        null=True,
        blank=True,
    )
    employment_salary_paid = models.DecimalField(
        verbose_name=_("employment salary paid"),
        decimal_places=2,
        max_digits=8,
        null=True,
        blank=True,
    )
    employment_description = models.TextField(
        verbose_name=_("employment description"), blank=True
    )
    hired_without_voucher_assessment = models.CharField(
        max_length=32,
        verbose_name=_("hired without voucher assessment"),
        null=True,
        blank=True,
        help_text=_(
            "Whether the employee would have been hired without a summer voucher."
        ),
        choices=HiredWithoutVoucherAssessment.choices,
    )

    is_exported = models.BooleanField(
        default=False,
        verbose_name=_("is exported"),
        help_text=_("Has been exported to Excel"),
    )

    ordering = models.IntegerField(default=0)

    @property
    def last_submitted_at(self) -> Optional[datetime]:
        if (
            last_submitted_history_entry := self.history.filter(
                pk=self.pk, application__status=EmployerApplicationStatus.SUBMITTED
            )
            .order_by("-modified_at")
            .first()
        ) :
            return last_submitted_history_entry.modified_at
        else:
            return (
                self.modified_at
                if self.application.status == EmployerApplicationStatus.SUBMITTED
                else None
            )

    class Meta:
        verbose_name = _("summer voucher")
        verbose_name_plural = _("summer vouchers")
        ordering = ["-application__created_at", "ordering"]


class Attachment(UUIDModel, TimeStampedModel):
    """
    created_at field from TimeStampedModel provides the upload timestamp
    """

    summer_voucher = models.ForeignKey(
        EmployerSummerVoucher,
        verbose_name=_("summer voucher"),
        related_name="attachments",
        on_delete=models.CASCADE,
    )
    attachment_type = models.CharField(
        max_length=64,
        verbose_name=_("attachment type in business rules"),
        choices=AttachmentType.choices,
    )
    content_type = models.CharField(
        max_length=100,
        choices=ATTACHMENT_CONTENT_TYPE_CHOICES,
        verbose_name=_("technical content type of the attachment"),
    )
    attachment_file = models.FileField(verbose_name=_("application attachment content"))

    def delete(self, using=None, keep_parents=False):
        self.attachment_file.delete()
        super().delete(using=using, keep_parents=keep_parents)

    class Meta:
        verbose_name = _("attachment")
        verbose_name_plural = _("attachments")
        ordering = ["-summer_voucher__created_at", "attachment_type", "-created_at"]
