import copy
import decimal
from unittest import mock

import pytest
from applications.api.v1.serializers import HandlerApplicationSerializer
from applications.enums import ApplicationStatus, BenefitType, OrganizationType
from applications.tests.conftest import *  # noqa
from applications.tests.test_applications_api import (
    add_attachments_to_application,
    get_detail_url,
    get_handler_detail_url,
)
from calculator.api.v1.serializers import CalculationSerializer
from calculator.tests.factories import CalculationFactory, PaySubsidyFactory
from common.tests.conftest import get_client_user
from common.utils import duration_in_months, to_decimal


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
    request, handler_api_client, application
):
    # also test that calculation rows are not created yet,
    # as all fields are not filled yet.
    application.status = ApplicationStatus.DRAFT
    application.pay_subsidy_percent = 50
    application.pay_subsidy_granted = True
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.save()
    assert not hasattr(application, "calculation")
    data = HandlerApplicationSerializer(application).data

    data["status"] = ApplicationStatus.RECEIVED
    data["bases"] = []  # as of 2021-10, bases are not used when submitting application
    add_attachments_to_application(request, application)
    if data["company"]["organization_type"] == OrganizationType.ASSOCIATION:
        data["association_has_business_activities"] = False
        data["association_immediate_manager_check"] = True

    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        response = handler_api_client.put(
            get_handler_detail_url(application),
            data,
        )

    assert response.status_code == 200
    application.refresh_from_db()
    assert hasattr(application, "calculation")

    assert response.data["calculation"] is not None
    assert response.data["calculation"]["monthly_pay"] == str(
        application.employee.monthly_pay
    )
    assert response.data["calculation"]["start_date"] is None
    assert len(response.data["calculation"]["rows"]) == 0
    assert response.status_code == 200


def test_application_can_not_create_calculation_through_api(
    handler_api_client, application
):
    """ """
    assert not hasattr(application, "calculation")
    data = HandlerApplicationSerializer(application).data
    calc_data = CalculationSerializer(CalculationFactory()).data
    data["calculation"] = calc_data
    response = handler_api_client.put(
        get_handler_detail_url(application),
        data,
    )
    assert response.status_code == 400
    application.refresh_from_db()
    assert not hasattr(application, "calculation")


def test_modify_calculation(handler_api_client, handling_application):
    """
    modify existing calculation
    """
    data = HandlerApplicationSerializer(handling_application).data
    assert handling_application.calculation
    handling_application.pay_subsidies.all().delete()
    data["calculation"]["monthly_pay"] = "1234.56"
    # also modify pay_subsidies. Although multiple objects are modified, calculate() should only
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
            "pay_subsidy_percent": 40,
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
    data["pay_subsidies"][0]["pay_subsidy_percent"] = 40
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
    assert response.data["pay_subsidies"][1]["pay_subsidy_percent"] == 40


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

    previous_data = copy.deepcopy(data["pay_subsidies"])

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
    assert previous_data == data_after["pay_subsidies"]


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
    "status",
    [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.DRAFT,
    ],
)
def test_assign_handler_invalid_status(
    handler_api_client, received_application, status
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
    assert response.status_code == 400


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
