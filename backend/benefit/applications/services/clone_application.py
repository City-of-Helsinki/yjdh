from io import BytesIO

from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image

from applications.enums import (
    AhjoStatus as AhjoStatusEnum,
)
from applications.enums import (
    ApplicationOrigin,
    ApplicationStatus,
    ApplicationStep,
    AttachmentType,
)
from applications.models import (
    AhjoStatus,
    Application,
    ApplicationLogEntry,
    Attachment,
    DeMinimisAid,
    Employee,
)
from calculator.models import Calculation
from companies.models import Company


def clone_application_based_on_other(
    application_base,
    clone_all_data=False,
):
    company = Company.objects.get(id=application_base.company.id)
    if clone_all_data:
        company.street_address = (
            company.street_address
            if len(company.street_address) > 0
            else "Testikatu 123"
        )

        company.postcode = company.postcode if len(company.postcode) > 0 else "00100"
        company.city = company.city if len(company.city) > 0 else "Testilä"

    cloned_application = Application(
        alternative_company_city=application_base.alternative_company_city,
        alternative_company_postcode=application_base.alternative_company_postcode,
        alternative_company_street_address=application_base.alternative_company_street_address,
        applicant_language="fi",
        application_origin=(
            application_base.application_origin
            if clone_all_data
            else ApplicationOrigin.APPLICANT
        ),
        application_step=ApplicationStep.STEP_1,
        archived=False,
        association_has_business_activities=application_base.association_has_business_activities
        or False,
        association_immediate_manager_check=application_base.association_immediate_manager_check
        or False,
        benefit_type="salary_benefit",
        co_operation_negotiations=application_base.co_operation_negotiations,
        co_operation_negotiations_description=application_base.co_operation_negotiations_description,
        company_bank_account_number=application_base.company_bank_account_number,
        company_contact_person_email=application_base.company_contact_person_email,
        company_contact_person_first_name=application_base.company_contact_person_first_name,
        company_contact_person_last_name=application_base.company_contact_person_last_name,
        company_contact_person_phone_number=application_base.company_contact_person_phone_number,
        company_department=application_base.company_department,
        company_form=application_base.company_form,
        company_form_code=company.company_form_code,
        company_name=application_base.company_name,
        de_minimis_aid=application_base.de_minimis_aid,
        status=ApplicationStatus.DRAFT,
        official_company_street_address=company.street_address,
        official_company_city=application_base.official_company_city,
        official_company_postcode=application_base.official_company_postcode,
        use_alternative_address=application_base.use_alternative_address,
    )

    company.save()
    cloned_application.company = company

    de_minimis_aids = application_base.de_minimis_aid_set.all()
    if de_minimis_aids.exists():
        cloned_application.de_minimis_aid = True

        last_order = DeMinimisAid.objects.last().ordering + 1
        for index, aid in enumerate(de_minimis_aids):
            aid.pk = None
            aid.ordering = last_order + index
            aid.application = cloned_application
            aid.save()

    if clone_all_data:
        cloned_application = _clone_handler_data(application_base, cloned_application)
    else:
        employee = Employee.objects.create(application=cloned_application)
        employee.first_name = ""
        employee.last_name = ""
        employee.social_security_number = ""
        employee.is_living_in_helsinki = False
        employee.job_title = ""
        employee.monthly_pay = None
        employee.vacation_money = None
        employee.other_expenses = None
        employee.working_hours = None
        employee.collective_bargaining_agreement = ""
        employee.save()

    cloned_application.save()
    return cloned_application


def _clone_handler_data(application_base, cloned_application):
    employee = Employee.objects.get(id=application_base.employee.id)
    employee.pk = None
    employee.application = cloned_application
    employee.save()

    cloned_application.handled_by_ahjo_automation = (
        application_base.handled_by_ahjo_automation
    )
    cloned_application.paper_application_date = application_base.paper_application_date
    cloned_application.applicant_language = application_base.applicant_language
    cloned_application.pay_subsidy_granted = application_base.pay_subsidy_granted
    cloned_application.apprenticeship_program = (
        application_base.apprenticeship_program or False
    )
    cloned_application.pay_subsidy_percent = application_base.pay_subsidy_percent
    cloned_application.additional_pay_subsidy_percent = (
        application_base.additional_pay_subsidy_percent
    )

    temp_image = Image.new("RGB", (1, 1), 0xFFFFFF)
    temp_image_io = BytesIO()
    temp_image.save(
        temp_image_io,
        format="PNG",
    )
    attachment_name = f"test-application-{cloned_application.id}.png"

    file_in_memory_upload = InMemoryUploadedFile(
        temp_image_io,
        None,
        attachment_name,
        "image/png",
        len(temp_image_io.getvalue()),
        None,
    )

    # Mimick the attachments by retaining attachment type
    for base_attachment in application_base.attachments.filter(
        attachment_type__in=[
            AttachmentType.EMPLOYMENT_CONTRACT,
            AttachmentType.PAY_SUBSIDY_DECISION,
            AttachmentType.COMMISSION_CONTRACT,
            AttachmentType.EDUCATION_CONTRACT,
            AttachmentType.HELSINKI_BENEFIT_VOUCHER,
            AttachmentType.EMPLOYEE_CONSENT,
            AttachmentType.FULL_APPLICATION,
            AttachmentType.OTHER_ATTACHMENT,
            AttachmentType.PDF_SUMMARY,
        ]
    ):
        Attachment.objects.create(
            attachment_type=base_attachment.attachment_type,
            application=cloned_application,
            attachment_file=file_in_memory_upload,
            content_type="image/png",
        )

    # Clone calculation with compensations and pay subsidies
    cloned_application.start_date = application_base.start_date
    cloned_application.end_date = application_base.end_date
    cloned_application.save()

    AhjoStatus.objects.create(
        status=AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
        application=cloned_application,
    )

    calculation_base = application_base.calculation
    Calculation.objects.create_for_application(
        cloned_application,
        start_date=calculation_base.start_date,
        end_date=calculation_base.end_date,
        state_aid_max_percentage=calculation_base.state_aid_max_percentage,
        override_monthly_benefit_amount=calculation_base.override_monthly_benefit_amount,
        override_monthly_benefit_amount_comment=calculation_base.override_monthly_benefit_amount_comment,
    )

    for compensation in application_base.training_compensations.all():
        compensation.pk = None
        compensation.application = cloned_application
        compensation.save()

    # Remove pay subsidies made by create_for_application, then clone the old ones
    cloned_application.pay_subsidies.filter(start_date__isnull=True).delete()
    for pay_subsidy in application_base.pay_subsidies.all():
        pay_subsidy.pk = None
        pay_subsidy.application = cloned_application
        pay_subsidy.save()

    cloned_application.calculation.calculate(override_status=True)
    cloned_application.calculation.save()

    cloned_application.status = ApplicationStatus.RECEIVED
    ApplicationLogEntry.objects.create(
        application=cloned_application,
        from_status=ApplicationStatus.DRAFT,
        to_status=cloned_application.status,
        comment="",
    )
    return cloned_application
