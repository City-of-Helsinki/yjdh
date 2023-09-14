from unittest import mock

from applications.api.v1.serializers.application import HandlerApplicationSerializer
from applications.enums import ApplicationOrigin, ApplicationStatus, BenefitType
from applications.tests.test_applications_api import (
    add_attachments_to_application,
    get_handler_detail_url,
)
from calculator.models import Calculation, PaySubsidy


def test_application_submit_creates_calculation_and_one_pay_subsidy(
    request, handler_api_client, application
):
    """
    Test that  submitting as a handler creates a new application with an initial calculation
    and pay subsidies based on the application data pay subsidy percents
    """
    add_attachments_to_application(request, application, True)
    application.application_origin = ApplicationOrigin.HANDLER
    application.save()

    data = HandlerApplicationSerializer(application).data
    response = handler_api_client.get(get_handler_detail_url(application))
    assert response.status_code == 200
    assert response.data["submitted_at"] is None
    assert response.data["calculation"] is None
    assert len(response.data["pay_subsidies"]) == 0
    assert len(response.data["training_compensations"]) == 0

    data["benefit_type"] = BenefitType.SALARY_BENEFIT
    data["pay_subsidy_percent"] = "50"
    data["pay_subsidy_granted"] = True

    response = handler_api_client.put(
        get_handler_detail_url(application),
        data,
    )
    assert response.status_code == 200

    response = _submit_handler_application(handler_api_client, data, application)
    assert response.status_code == 200
    application.refresh_from_db()
    assert application.status == ApplicationStatus.RECEIVED
    assert application.pay_subsidy_percent == 50
    assert application.additional_pay_subsidy_percent == 70

    calculation = Calculation.objects.get(application_id=application.id)
    assert calculation is not None
    pay_subsidies = PaySubsidy.objects.all()
    # Confirm that the pay subsidies are created correctly into the database
    assert pay_subsidies.count() == 2
    assert pay_subsidies[0].pay_subsidy_percent == 50
    assert pay_subsidies[1].pay_subsidy_percent == 70


def _submit_handler_application(api_client, data, application):
    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        data["status"] = ApplicationStatus.RECEIVED
        return api_client.put(
            get_handler_detail_url(application),
            data,
        )
