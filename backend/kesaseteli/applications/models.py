from django.db import models
from django.utils.translation import gettext_lazy as _
from django_cryptography.fields import encrypt
from shared.models.abstract_models import HistoricalModel, UUIDModel

from applications.enums import ApplicationStatus
from companies.models import Company


class Application(HistoricalModel, UUIDModel):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="applications",
        verbose_name=_("company"),
    )
    status = models.CharField(
        max_length=64,
        verbose_name=_("status"),
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.DRAFT,
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


class SummerVoucher(HistoricalModel, UUIDModel):
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="summer_vouchers",
        verbose_name=_("application"),
    )
    summer_voucher_id = models.CharField(
        max_length=256, blank=True, verbose_name=_("summer voucher id")
    )
    contact_name = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("contact name"),
    )
    contact_email = models.EmailField(
        blank=True,
        verbose_name=_("contact email"),
    )
    work_postcode = models.CharField(
        max_length=256,
        blank=True,
        verbose_name=_("work postcode"),
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
    employee_ssn = encrypt(
        models.CharField(
            max_length=32,
            blank=True,
            verbose_name=_("employee social security number"),
        )
    )
    employee_phone_number = models.CharField(
        max_length=64,
        blank=True,
        verbose_name=_("employee phone number"),
    )

    is_unnumbered_summer_voucher = models.BooleanField(
        default=False,
        verbose_name=_("is unnumbered summer voucher"),
    )
    unnumbered_summer_voucher_reason = models.TextField(
        default="",
        verbose_name=_("unnumbered summer voucher reason"),
    )

    employment_contract = models.FileField(
        blank=True, verbose_name=_("employment contract")
    )
    payslip = models.FileField(blank=True, verbose_name=_("payslip"))
