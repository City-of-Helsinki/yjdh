from applications.enums import ApplicationStep
from applications.models import Application, DeMinimisAid, Employee
from companies.models import Company


def clone_application_based_on_other(
    application_base,
    clone_employee=False,
    clone_work=False,
    clone_subsidies=False,
):
    company = Company.objects.get(id=application_base.company.id)
    cloned_application = Application(
        **{
            "alternative_company_city": application_base.alternative_company_city,
            "alternative_company_postcode": application_base.alternative_company_postcode,
            "alternative_company_street_address": application_base.alternative_company_street_address,
            "applicant_language": "fi",
            "application_step": ApplicationStep.STEP_1,
            "archived": False,
            "association_has_business_activities": application_base.association_has_business_activities,
            "association_immediate_manager_check": application_base.association_immediate_manager_check,
            "benefit_type": "salary_benefit",
            "co_operation_negotiations": application_base.co_operation_negotiations,
            "co_operation_negotiations_description": application_base.co_operation_negotiations_description,
            "company_bank_account_number": application_base.company_bank_account_number,
            "company_contact_person_email": application_base.company_contact_person_email,
            "company_contact_person_first_name": application_base.company_contact_person_first_name,
            "company_contact_person_last_name": application_base.company_contact_person_last_name,
            "company_contact_person_phone_number": application_base.company_contact_person_phone_number,
            "company_department": application_base.company_department,
            "company_form_code": company.company_form_code,
            "de_minimis_aid": application_base.de_minimis_aid,
            "status": "draft",
            "use_alternative_address": application_base.use_alternative_address,
        }
    )

    cloned_application.company = company

    if clone_employee or clone_work:
        employee = Employee.objects.get(id=application_base.employee.id)
        employee.pk = None
        employee.application = cloned_application
    else:
        employee = Employee.objects.create(application=cloned_application)

    if not clone_employee:
        employee.first_name = ""
        employee.last_name = ""
        employee.social_security_number = ""
        employee.is_living_in_helsinki = False

    if not clone_work:
        employee.job_title = ""
        employee.monthly_pay = None
        employee.vacation_money = None
        employee.other_expenses = None
        employee.working_hours = None
        employee.collective_bargaining_agreement = ""

    employee.save()

    if clone_subsidies:
        cloned_application.pay_subsidy_granted = application_base.pay_subsidy_granted
        cloned_application.apprenticeship_program = (
            application_base.apprenticeship_program
        )
        cloned_application.pay_subsidy_percent = application_base.pay_subsidy_percent

    de_minimis_aids = DeMinimisAid.objects.filter(
        application__pk=application_base.id
    ).all()

    if de_minimis_aids.exists():
        cloned_application.de_minimis_aid = True

        last_order = DeMinimisAid.objects.last().ordering + 1
        for index, aid in enumerate(de_minimis_aids):
            aid.pk = None
            aid.ordering = last_order + index
            aid.application = cloned_application
            aid.save()

    cloned_application.save()
    return cloned_application
