import logging
from datetime import timedelta
from urllib.parse import quote, urljoin

from django.conf import settings
from django.core.mail import send_mail
from django.db import models, transaction
from django.db.models import Q
from django.urls import reverse
from django.utils import timezone, translation
from django.utils.translation import gettext, gettext_lazy as _
from encrypted_fields.fields import EncryptedCharField, SearchField
from shared.common.utils import MatchesAnyOfQuerySet
from shared.common.validators import (
    validate_name,
    validate_optional_json,
    validate_phone_number,
    validate_postcode,
)
from shared.models.abstract_models import HistoricalModel, TimeStampedModel, UUIDModel

from applications.enums import (
    APPLICATION_LANGUAGE_CHOICES,
    ATTACHMENT_CONTENT_TYPE_CHOICES,
    AttachmentType,
    EmployerApplicationStatus,
    HiredWithoutVoucherAssessment,
    SummerVoucherExceptionReason,
    YouthApplicationStatus,
)
from common.permissions import HandlerPermission
from common.urls import handler_youth_application_processing_url
from common.utils import validate_finnish_social_security_number
from companies.models import Company

LOGGER = logging.getLogger(__name__)


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


class YouthApplication(TimeStampedModel, UUIDModel):
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
    encrypted_vtj_json = EncryptedCharField(
        null=True,
        blank=True,
        max_length=1024 * 1024,
        verbose_name=_("vtj json"),
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
    objects = YouthApplicationQuerySet.as_manager()

    def handler_processing_url(self):
        return handler_youth_application_processing_url(self.pk)

    def _localized_frontend_page_url(self, page_name):
        return urljoin(
            settings.YOUTH_URL, f"/{quote(self.language)}/{quote(page_name)}"
        )

    def activated_page_url(self):
        return self._localized_frontend_page_url("activated")

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
    def _activation_email_subject(language):
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

    def _processing_email_subject(self):
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

    @staticmethod
    def _send_mail(subject, message, from_email, recipient_list, error_message) -> bool:
        """
        Send email with given parameters and log given error message in case of failure.

        :param subject: Email subject
        :param message: Email body
        :param from_email: Email address of the email's sender
        :param recipient_list: List of email recipients
        :param error_message: Error message to be logged in case of failure
        :return: True if email was sent, otherwise False.
        """
        sent_email_count = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=True,
        )
        if sent_email_count == 0:
            LOGGER.error(error_message)
        return sent_email_count > 0

    def send_activation_email(self, request, language) -> bool:
        """
        Send youth application's activation email with given language to the applicant.

        :param request: Request used for generating the activation link
        :param language: The activation email language to be used
        :return: True if email was sent, otherwise False.
        """
        return YouthApplication._send_mail(
            subject=YouthApplication._activation_email_subject(language),
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
        return YouthApplication._send_mail(
            subject=self._processing_email_subject(),
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

    def set_handler(self, handler):
        try:
            self.handler = handler
        except ValueError:  # e.g. cannot assign AnonymousUser: Must be a User instance
            self.handler = None
        if self.handler is None and not HandlerPermission.allow_empty_handler():
            raise ValueError("Forbidden empty handler")

    @transaction.atomic
    def handle(self, status: YouthApplicationStatus, handler):
        """
        Handle the youth application by setting the status, handler and handled_at.

        :param status: The target status
        :type status: YouthApplicationStatus
        :param handler: Handler user
        :type handler: None | AnonymousUser | User
        """
        if status not in YouthApplicationStatus.handled_values():
            raise ValueError(f"Invalid handle status: {status}")
        self.status = status
        self.set_handler(handler)
        self.handled_at = timezone.now()
        self.save()

    @property
    def is_accepted(self) -> bool:
        return self.status == YouthApplicationStatus.ACCEPTED

    def can_accept(self, handler) -> bool:
        return (
            self.status in YouthApplicationStatus.acceptable_values()
            and HandlerPermission.has_user_permission(handler)
        )

    @transaction.atomic
    def accept(self, handler) -> bool:
        """
        Accept this youth application using given handler user if possible.

        :return: self.is_accepted
        """
        if self.can_accept(handler=handler):
            self.handle(status=YouthApplicationStatus.ACCEPTED, handler=handler)
        return self.is_accepted

    @property
    def is_rejected(self) -> bool:
        return self.status == YouthApplicationStatus.REJECTED

    def can_reject(self, handler) -> bool:
        return (
            self.status in YouthApplicationStatus.rejectable_values()
            and HandlerPermission.has_user_permission(handler)
        )

    @transaction.atomic
    def reject(self, handler) -> bool:
        """
        Reject youth application using given handler user if possible.

        :return: self.is_rejected
        """
        if self.can_reject(handler=handler):
            self.handle(status=YouthApplicationStatus.REJECTED, handler=handler)
        return self.is_rejected

    @classmethod
    def is_email_or_social_security_number_active(
        cls, email, social_security_number
    ) -> bool:
        """
        Is there an active youth application created that uses the same email or social
        security number as this youth application?

        :return: True if this youth application's email or social security number are
                 used by at least one active youth application, otherwise False.
        """
        return (
            cls.objects.matches_email_or_social_security_number(
                email, social_security_number
            )
            .active()
            .exists()
        )

    @classmethod
    def is_email_used(cls, email) -> bool:
        """
        Is this youth application's email used by unexpired or active youth application?

        :return: True if this youth application's email is used by at least one
                 unexpired or active youth application, otherwise False.
        """
        return cls.objects.filter(email=email).unexpired_or_active().exists()

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
    youth_application = models.ForeignKey(
        YouthApplication,
        on_delete=models.CASCADE,
        related_name="youth_summer_vouchers",
        verbose_name=_("youth application"),
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

    class Meta:
        verbose_name = _("youth summer voucher")
        verbose_name_plural = _("youth summer vouchers")
        ordering = ["-youth_application__created_at"]


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
