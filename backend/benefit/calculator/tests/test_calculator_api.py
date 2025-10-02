import copy
import decimal
from datetime import datetime, timedelta
from unittest import mock

import factory
import pytest
from django.utils import timezone

from applications.api.v1.serializers.application import (
    ApplicantApplicationSerializer,
    HandlerApplicationSerializer,
)
from applications.enums import (
    ApplicationStatus,
    BenefitType,
    OrganizationType,
    PaySubsidyGranted,
)
from applications.tests.conftest import *  # noqa
from applications.tests.factories import ReceivedApplicationFactory
from applications.tests.test_applications_api import (
    add_attachments_to_application,
    get_detail_url,
    get_handler_detail_url,
)
from calculator.api.v1.serializers import CalculationSerializer
from calculator.enums import InstalmentStatus
from calculator.tests.factories import CalculationFactory, PaySubsidyFactory
from common.tests.conftest import get_client_user
from common.utils import duration_in_months, to_decimal


def _set_two_pay_subsidies_with_empty_dates(data: dict) -> dict:
    data["pay_subsidies"] = [
        {
            "start_date": None,
            "end_date": None,
            "pay_subsidy_percent": 100,
            "work_time_percent": 40,
        },
        {
            "start_date": None,
            "end_date": None,
            "pay_subsidy_percent": 70,
            "work_time_percent": 40,
        },
    ]
    return data


def _set_two_pay_subsidies_with_non_empty_dates(data: dict) -> dict:
    start = datetime.now() + timedelta(days=1)
    end = datetime.now() + timedelta(weeks=8)
    data["pay_subsidies"] = [
        {
            "start_date": start.strftime("%Y-%m-%d"),
            "end_date": end.strftime("%Y-%m-%d"),
            "pay_subsidy_percent": 100,
            "work_time_percent": 40,
        },
        {
            "start_date": start.strftime("%Y-%m-%d"),
            "end_date": end.strftime("%Y-%m-%d"),
            "pay_subsidy_percent": 40,
            "work_time_percent": 40,
        },
    ]
    return data


def test_application_retrieve_calculation_as_handler(
    handler_api_client, handling_application
):
    pay_subsidy = handling_application.pay_subsidies.first()
    response = handler_api_client.get(get_handler_detail_url(handling_application))
    assert response.status_code == 200
    assert "calculation" in response.data
    assert "pay_subsidies" in response.data
    assert "training_compensations" in response.data
    assert decimal.Decimal(
        response.data["calculation"]["duration_in_months_rounded"]
    ) == to_decimal(
        duration_in_months(
            handling_application.calculation.start_date,
            handling_application.calculation.end_date,
        ),
        2,
    )
    assert decimal.Decimal(
        response.data["pay_subsidies"][0]["duration_in_months_rounded"]
    ) == to_decimal(duration_in_months(pay_subsidy.start_date, pay_subsidy.end_date), 2)


def test_application_try_retrieve_calculation_as_applicant(api_client, application):
    response = api_client.get(get_detail_url(application))
    assert "calculation" not in response.data
    assert "pay_subsidies" not in response.data
    assert "training_compensations" not in response.data
    assert response.status_code == 200


def test_application_create_calculation_on_submit(
    request,
    api_client,
    handler_api_client,
    application,
):
    # also test that calculation rows are not created yet,
    # as all fields are not filled yet.
    application.status = ApplicationStatus.DRAFT
    application.pay_subsidy_percent = 50
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.apprenticeship_program = False
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.save()
    assert not hasattr(application, "calculation")
    data = ApplicantApplicationSerializer(application).data

    data["status"] = ApplicationStatus.RECEIVED
    data["bases"] = []  # as of 2021-10, bases are not used when submitting application
    add_attachments_to_application(request, application)
    if data["company"]["organization_type"] == OrganizationType.ASSOCIATION:
        data["association_has_business_activities"] = False
        data["association_immediate_manager_check"] = True

    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        # applicant submits the application
        applicant_response = api_client.put(
            get_detail_url(application),
            data,
        )
        # applicant does not see the calculation
        assert "calculation" not in applicant_response.data

    assert applicant_response.status_code == 200
    application.refresh_from_db()
    assert hasattr(application, "calculation")

    # handler retrieves the application for the first time
    handler_response = handler_api_client.get(get_handler_detail_url(application))

    assert handler_response.data["calculation"] is not None
    assert handler_response.data["calculation"]["monthly_pay"] == str(
        application.employee.monthly_pay
    )
    assert handler_response.data["calculation"]["start_date"] is None
    assert len(handler_response.data["calculation"]["rows"]) == 0
    assert handler_response.status_code == 200


def test_application_can_not_create_calculation_through_api(
    handler_api_client, handling_application
):
    """ """
    handling_application.calculation.delete()
    handling_application.refresh_from_db()
    assert not hasattr(handling_application, "calculation")
    data = HandlerApplicationSerializer(handling_application).data
    calc_data = CalculationSerializer(CalculationFactory()).data
    data["calculation"] = calc_data
    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 400
    handling_application.refresh_from_db()
    assert not hasattr(handling_application, "calculation")


def test_modify_calculation(handler_api_client, handling_application):
    """
    modify existing calculation
    """
    data = HandlerApplicationSerializer(handling_application).data
    assert handling_application.calculation
    handling_application.pay_subsidies.all().delete()
    data["calculation"]["monthly_pay"] = "1234.56"
    # also modify pay_subsidies. Although multiple objects are modified, calculate()
    # should only
    # be called once.
    data["pay_subsidies"] = [
        {
            "start_date": str(handling_application.start_date),
            "end_date": str(handling_application.end_date),
            "pay_subsidy_percent": 50,
            "work_time_percent": "100.00",
        }
    ]
    data["training_compensations"] = [
        {
            "start_date": str(handling_application.start_date),
            "end_date": str(handling_application.end_date),
            "monthly_amount": "50",
        }
    ]
    with mock.patch("calculator.models.Calculation.calculate") as calculate_wrap:
        response = handler_api_client.put(
            get_handler_detail_url(handling_application),
            data,
        )
        calculate_wrap.assert_called_once()

    assert response.status_code == 200
    assert response.data["calculation"]["monthly_pay"] == "1234.56"
    handling_application.refresh_from_db()
    assert handling_application.calculation.monthly_pay == decimal.Decimal("1234.56")
    assert handling_application.pay_subsidies.count() == 1
    assert handling_application.pay_subsidies.first().pay_subsidy_percent == 50
    assert (
        handling_application.pay_subsidies.first().start_date
        == handling_application.start_date
    )
    assert (
        handling_application.pay_subsidies.first().end_date
        == handling_application.end_date
    )
    assert handling_application.pay_subsidies.count() == 1
    assert handling_application.pay_subsidies.first().pay_subsidy_percent == 50
    assert (
        handling_application.pay_subsidies.first().start_date
        == handling_application.start_date
    )
    assert (
        handling_application.pay_subsidies.first().end_date
        == handling_application.end_date
    )

    assert handling_application.training_compensations.count() == 1
    assert handling_application.training_compensations.first().monthly_amount == 50
    assert (
        handling_application.training_compensations.first().start_date
        == handling_application.start_date
    )
    assert (
        handling_application.training_compensations.first().end_date
        == handling_application.end_date
    )


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
        ApplicationStatus.REJECTED,
    ],
)
def test_modify_calculation_invalid_status(
    handler_api_client, handling_application, status
):
    handling_application.status = status
    data = HandlerApplicationSerializer(handling_application).data
    assert handling_application.calculation
    handling_application.pay_subsidies.all().delete()
    assert handling_application.calculation.handler is not None
    data["calculation"]["handler"] = None
    data["pay_subsidies"] = [
        {
            "start_date": str(handling_application.start_date),
            "end_date": str(handling_application.end_date),
            "pay_subsidy_percent": 50,
            "work_time_percent": "50.00",
        }
    ]
    with mock.patch("calculator.models.Calculation.calculate") as calculate_wrap:
        response = handler_api_client.put(
            get_handler_detail_url(handling_application),
            data,
        )
        calculate_wrap.assert_not_called()
        assert response.data["calculation"]["handler_details"]["id"] is not None
        assert len(response.data["pay_subsidies"]) == 0
        assert response.status_code == 200

    handling_application.refresh_from_db()
    assert handling_application.calculation.handler is not None
    assert handling_application.pay_subsidies.all().count() == 0


def test_can_not_delete_calculation(handler_api_client, received_application):
    """
    application.calculation can not be deleted through the API - setting application to None is ignored
    """
    data = HandlerApplicationSerializer(received_application).data
    data["calculation"] = None
    handler_api_client.put(
        get_handler_detail_url(received_application),
        data,
    )
    received_application.refresh_from_db()
    assert received_application.calculation


def test_application_replace_pay_subsidy(handler_api_client, handling_application):
    data = HandlerApplicationSerializer(handling_application).data

    data["pay_subsidies"] = [
        {
            "start_date": str(handling_application.start_date),
            "end_date": str(handling_application.end_date),
            "pay_subsidy_percent": 50,
            "work_time_percent": "100.00",
            "disability_or_illness": True,
        }
    ]
    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 200
    handling_application.refresh_from_db()
    new_data = HandlerApplicationSerializer(handling_application).data
    del new_data["pay_subsidies"][0]["id"]  # id is expected to change
    # on-the-fly generated field that was not present in the PUT request
    del new_data["pay_subsidies"][0]["duration_in_months_rounded"]
    assert new_data["pay_subsidies"] == data["pay_subsidies"]


def test_application_edit_pay_subsidy(handler_api_client, handling_application):
    handling_application.pay_subsidies.all().delete()
    PaySubsidyFactory(application=handling_application)
    PaySubsidyFactory(application=handling_application)
    data = HandlerApplicationSerializer(handling_application).data

    # edit fields
    data["pay_subsidies"][0]["start_date"] = "2021-06-01"
    data["pay_subsidies"][0]["pay_subsidy_percent"] = 70
    # swap order
    data["pay_subsidies"][0], data["pay_subsidies"][1] = (
        data["pay_subsidies"][1],
        data["pay_subsidies"][0],
    )
    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 200
    assert len(response.data["pay_subsidies"]) == 2
    assert response.data["pay_subsidies"][1]["start_date"] == "2021-06-01"
    assert response.data["pay_subsidies"][1]["pay_subsidy_percent"] == 70


def test_application_delete_pay_subsidy(handler_api_client, handling_application):
    data = HandlerApplicationSerializer(handling_application).data

    data["pay_subsidies"] = []

    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 200
    assert response.data["pay_subsidies"] == []


def test_application_edit_pay_subsidy_invalid_values(
    handler_api_client, handling_application
):
    data = HandlerApplicationSerializer(handling_application).data

    previous_pay_subsidies = copy.deepcopy(data["pay_subsidies"])

    data["pay_subsidies"] = [
        {
            "start_date": str(handling_application.start_date),
            "end_date": str(handling_application.end_date),
            "pay_subsidy_percent": 150,
            "work_time_percent": -10,
        },
        {
            "start_date": str(handling_application.start_date),
            "end_date": str(handling_application.end_date),
            "pay_subsidy_percent": 100,
            "work_time_percent": "101.50",
        },
    ]

    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 400

    handling_application.refresh_from_db()
    data_after = HandlerApplicationSerializer(handling_application).data
    assert previous_pay_subsidies == data_after["pay_subsidies"]


def test_application_edit_pay_subsidy_empty_date_values(
    handler_api_client, handling_application
):
    handling_application.benefit_type = BenefitType.SALARY_BENEFIT
    handling_application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    handling_application.save()
    data = HandlerApplicationSerializer(handling_application).data

    previous_pay_subsidies = copy.deepcopy(data["pay_subsidies"])

    _set_two_pay_subsidies_with_empty_dates(data)

    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 400

    handling_application.refresh_from_db()
    data_after = HandlerApplicationSerializer(handling_application).data
    assert previous_pay_subsidies == data_after["pay_subsidies"]


def test_ignore_pay_subsidy_dates_when_application_is_received(
    handler_api_client, received_application
):
    """
    paysubsidy validation should be skipped when application isn't yet opened by handler
    """
    data = HandlerApplicationSerializer(received_application).data

    _set_two_pay_subsidies_with_empty_dates(data)

    response = handler_api_client.put(
        get_handler_detail_url(received_application),
        data,
    )
    assert response.status_code == 200


def test_subsidies_validation_when_state_aid_max_percentage_is_not_set(
    handler_api_client,
    mock_get_organisation_roles_and_create_company,
):
    with factory.Faker.override_default_locale("fi_FI"):
        handling_application = ReceivedApplicationFactory(
            status=ApplicationStatus.HANDLING,
            apprenticeship_program=False,
            benefit_type=BenefitType.SALARY_BENEFIT,
            company=mock_get_organisation_roles_and_create_company,
            pay_subsidy_granted=PaySubsidyGranted.GRANTED,
            pay_subsidy_percent=100,
            additional_pay_subsidy_percent=40,
        )

        data = HandlerApplicationSerializer(handling_application).data
        _set_two_pay_subsidies_with_non_empty_dates(data)
        assert data["calculation"]["state_aid_max_percentage"] is None

        response = handler_api_client.put(
            get_handler_detail_url(handling_application), data
        )

        assert response.status_code == 400
        assert "pay_subsidies" in response.json()
        assert {
            "state_aid_max_percentage": ["State aid maximum percentage cannot be empty"]
        } in response.json()["pay_subsidies"]


@pytest.mark.parametrize("benefit_type", BenefitType.values)
@pytest.mark.parametrize(
    "override_monthly_benefit_amount,override_monthly_benefit_amount_comment",
    [(None, ""), (100, "Test comment")],
)
def test_pay_subsidies_validation_in_handling(
    handler_api_client,
    mock_get_organisation_roles_and_create_company,
    override_monthly_benefit_amount,
    override_monthly_benefit_amount_comment,
    benefit_type,
):
    expect_validation_error = (
        benefit_type == BenefitType.SALARY_BENEFIT
        and override_monthly_benefit_amount is None
    )
    with factory.Faker.override_default_locale("fi_FI"):
        handling_application = ReceivedApplicationFactory(
            status=ApplicationStatus.HANDLING,
            apprenticeship_program=False,
            benefit_type=benefit_type,
            calculation__override_monthly_benefit_amount=override_monthly_benefit_amount,
            calculation__override_monthly_benefit_amount_comment=override_monthly_benefit_amount_comment,
            company=mock_get_organisation_roles_and_create_company,
            pay_subsidy_granted=PaySubsidyGranted.GRANTED,
            pay_subsidy_percent=100,
            additional_pay_subsidy_percent=70,
        )
    data = HandlerApplicationSerializer(handling_application).data
    _set_two_pay_subsidies_with_empty_dates(data)

    # Make sure the test data has been set up correctly
    assert data["benefit_type"] == benefit_type
    assert (data["calculation"]["override_monthly_benefit_amount"] is None) == (
        override_monthly_benefit_amount is None
    )
    assert (
        data["calculation"]["override_monthly_benefit_amount_comment"]
        == override_monthly_benefit_amount_comment
    )

    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )

    if expect_validation_error:
        assert response.status_code == 400
        assert "pay_subsidies" in response.json()
        assert {"start_date": ["Start date cannot be empty"]} in response.json()[
            "pay_subsidies"
        ]
    else:
        assert response.status_code == 200


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.HANDLING,
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
    ],
)
def test_validate_pay_subsidy_dates_when_application_is_handled(
    handler_api_client, application, status
):
    """
    paysubsidy should be validated when application has gone through the handling state
    """
    application.status = status
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.pay_subsidy_granted = PaySubsidyGranted.GRANTED
    application.apprenticeship_program = False
    application.save()
    data = HandlerApplicationSerializer(application).data

    _set_two_pay_subsidies_with_empty_dates(data)

    response = handler_api_client.put(
        get_handler_detail_url(application),
        data,
    )
    assert response.status_code == 400


def test_ignore_pay_subsidy_dates_in_received_to_handling_transition(
    handler_api_client, received_application
):
    """
    paysubsidy validation should be skipped when application is first moved to handling
    """
    data = HandlerApplicationSerializer(received_application).data
    _set_two_pay_subsidies_with_empty_dates(data)
    data["status"] = ApplicationStatus.HANDLING

    response = handler_api_client.put(
        get_handler_detail_url(received_application),
        data,
    )
    assert response.status_code == 200


def test_ignore_pay_subsidy_dates_when_on_manual_calculator(
    handler_api_client, handling_application
):
    """
    paysubsidy validation should be skipped when manual calculator is toggled on
    (When override_monthly_benefit_amount is not None)
    """
    data = HandlerApplicationSerializer(handling_application).data
    data["calculation"]["start_date"] = str(handling_application.start_date)
    data["calculation"]["end_date"] = str(handling_application.end_date)
    data["calculation"]["override_monthly_benefit_amount"] = "100.00"
    data["calculation"]["override_monthly_benefit_amount_comment"] = (
        "This is a comment."
    )

    _set_two_pay_subsidies_with_empty_dates(data)

    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 200

    handling_application.refresh_from_db()
    data_after = HandlerApplicationSerializer(handling_application).data
    assert data_after["calculation"]["start_date"] == data["calculation"]["start_date"]
    assert data_after["calculation"]["end_date"] == data["calculation"]["end_date"]
    assert (
        data_after["calculation"]["override_monthly_benefit_amount"]
        == data["calculation"]["override_monthly_benefit_amount"]
    )
    assert (
        data_after["calculation"]["override_monthly_benefit_amount_comment"]
        == data["calculation"]["override_monthly_benefit_amount_comment"]
    )


def test_assign_handler(handler_api_client, received_application):
    user = get_client_user(handler_api_client)
    user.first_name = "adminFirst"
    user.last_name = "adminLast"
    user.save()
    data = HandlerApplicationSerializer(received_application).data
    assert received_application.calculation
    data["status"] = ApplicationStatus.HANDLING
    data["calculation"]["handler"] = get_client_user(handler_api_client).pk
    response = handler_api_client.put(
        get_handler_detail_url(received_application),
        data,
    )

    assert response.status_code == 200
    assert response.data["calculation"]["handler_details"]["id"] == str(
        get_client_user(handler_api_client).pk
    )
    assert (
        response.data["calculation"]["handler_details"]["first_name"]
        == get_client_user(handler_api_client).first_name
    )
    assert (
        response.data["calculation"]["handler_details"]["last_name"]
        == get_client_user(handler_api_client).last_name
    )


@pytest.mark.parametrize(
    "status,expected_result",
    [
        (ApplicationStatus.ACCEPTED, 400),
        (ApplicationStatus.CANCELLED, 400),
        (ApplicationStatus.REJECTED, 400),
        (ApplicationStatus.DRAFT, 400),
    ],
)
def test_assign_handler_invalid_status(
    handler_api_client, received_application, status, expected_result
):
    received_application.status = status
    received_application.save()
    data = HandlerApplicationSerializer(received_application).data
    assert received_application.calculation
    data["status"] = ApplicationStatus.HANDLING
    data["calculation"]["handler"] = get_client_user(handler_api_client).pk
    response = handler_api_client.put(
        get_handler_detail_url(received_application),
        data,
    )
    assert response.status_code == expected_result


def test_unassign_handler_valid_status(handler_api_client, handling_application):
    data = HandlerApplicationSerializer(handling_application).data
    assert handling_application.calculation
    data["calculation"]["handler"] = None
    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 200
    assert response.data["calculation"]["handler_details"] is None


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
        ApplicationStatus.REJECTED,
    ],
)
def test_unassign_handler_invalid_status(
    handler_api_client, handling_application, status
):
    handling_application.status = status
    handling_application.save()
    data = HandlerApplicationSerializer(handling_application).data
    assert handling_application.calculation
    data["calculation"]["handler"] = None
    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 400


def test_application_calculation_rows_id_exists(
    handler_api_client, handling_application
):
    handling_application.calculation.init_calculator()
    handling_application.calculation.calculate()
    response = handler_api_client.get(get_handler_detail_url(handling_application))
    assert response.status_code == 200
    assert len(response.data["calculation"]["rows"]) > 1
    assert "id" in response.data["calculation"]["rows"][0].keys()


@pytest.mark.parametrize(
    "number_of_instalments, has_subsidies",
    [(2, False), (1, True)],
)
def test_application_calculation_instalments(
    handling_application, settings, number_of_instalments, has_subsidies
):
    settings.PAYMENT_INSTALMENTS_ENABLED = True
    settings.INSTALMENT_THRESHOLD = 9600
    settings.SALARY_BENEFIT_NEW_MAX = 1500
    settings.FIRST_INSTALMENT_LIMIT = 9000

    if has_subsidies is False:
        handling_application.pay_subsidies.all().delete()
        assert handling_application.pay_subsidies.count() == 0
        handling_application.pay_subsidy_granted = PaySubsidyGranted.NOT_GRANTED
        handling_application.save()

        handling_application.calculation.start_date = datetime.now()
        handling_application.calculation.end_date = (
            handling_application.start_date + timedelta(weeks=52)
        )
        handling_application.calculation.save()

    handling_application.calculation.init_calculator()
    handling_application.calculation.calculate()

    assert handling_application.calculation.instalments.count() == number_of_instalments
    instalment_1 = handling_application.calculation.instalments.all()[0]

    assert instalment_1.due_date is not None
    assert instalment_1.status == InstalmentStatus.WAITING

    due_date = instalment_1.due_date
    now_date = timezone.now().date()

    assert due_date == now_date

    assert due_date == now_date

    if number_of_instalments == 1:
        assert (
            instalment_1.amount
            == handling_application.calculation.calculated_benefit_amount
        )
        assert instalment_1.status == InstalmentStatus.WAITING

    if number_of_instalments == 2:
        assert instalment_1.amount == decimal.Decimal(settings.FIRST_INSTALMENT_LIMIT)
        assert instalment_1.status == InstalmentStatus.WAITING

        instalment_2 = handling_application.calculation.instalments.all()[1]
        assert (
            instalment_2.amount
            == handling_application.calculation.calculated_benefit_amount
            - decimal.Decimal(settings.FIRST_INSTALMENT_LIMIT)
        )
        assert instalment_2.status == InstalmentStatus.WAITING

        due_date = instalment_2.due_date
        future_date = timezone.now() + timedelta(days=181)
        assert due_date == future_date.date()
