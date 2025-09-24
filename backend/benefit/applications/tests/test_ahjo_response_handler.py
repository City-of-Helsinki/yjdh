from datetime import datetime
from unittest.mock import patch

import pytest
from django.core.exceptions import ValidationError

from applications.enums import (
    AhjoDecision,
    AhjoDecisionDetails,
    ApplicationBatchStatus,
    ApplicationStatus,
)
from applications.enums import (
    AhjoStatus as AhjoStatusEnum,
)
from applications.services.ahjo.enums import AhjoSettingName
from applications.services.ahjo.response_handler import (
    AhjoDecisionDetailsResponseHandler,
    AhjoResponseHandler,
)
from calculator.enums import InstalmentStatus
from calculator.models import Instalment


def test_ahjo_response_handler_filter_decision_makers(decisionmaker_response):
    result = AhjoResponseHandler.filter_decision_makers(decisionmaker_response[1])
    assert len(result) == 2
    assert result == [
        {
            "Name": decisionmaker_response[1]["decisionMakers"][0]["Organization"][
                "Name"
            ],
            "ID": decisionmaker_response[1]["decisionMakers"][0]["Organization"]["ID"],
        },
        {
            "Name": decisionmaker_response[1]["decisionMakers"][1]["Organization"][
                "Name"
            ],
            "ID": decisionmaker_response[1]["decisionMakers"][1]["Organization"]["ID"],
        },
    ]


def test_ahjo_response_handler_filter_signers(signer_response):
    result = AhjoResponseHandler.filter_signers(signer_response)
    assert len(result) == 3
    assert result == [
        {
            "Name": signer_response["agentList"][0]["Name"],
            "ID": signer_response["agentList"][0]["ID"],
        },
        {
            "Name": signer_response["agentList"][1]["Name"],
            "ID": signer_response["agentList"][1]["ID"],
        },
        {
            "Name": signer_response["agentList"][2]["Name"],
            "ID": signer_response["agentList"][2]["ID"],
        },
    ]


@pytest.mark.parametrize(
    "setting_name",
    [
        (AhjoSettingName.DECISION_MAKER),
        (AhjoSettingName.SIGNER),
    ],
)
@patch("applications.models.AhjoSetting.objects.update_or_create")
def test_handle_ahjo_query_response_successful(
    mock_update_or_create, decisionmaker_response, setting_name, signer_response
):
    """Test successful handling of setting response"""
    if setting_name == AhjoSettingName.DECISION_MAKER:
        mock_response = decisionmaker_response[1]
        data = [
            {
                "Name": decisionmaker_response[1]["decisionMakers"][0]["Organization"][
                    "Name"
                ],
                "ID": decisionmaker_response[1]["decisionMakers"][0]["Organization"][
                    "ID"
                ],
            },
            {
                "Name": decisionmaker_response[1]["decisionMakers"][1]["Organization"][
                    "Name"
                ],
                "ID": decisionmaker_response[1]["decisionMakers"][1]["Organization"][
                    "ID"
                ],
            },
        ]
    if setting_name == AhjoSettingName.SIGNER:
        mock_response = signer_response
        data = [
            {
                "Name": signer_response["agentList"][0]["Name"],
                "ID": signer_response["agentList"][0]["ID"],
            },
            {
                "Name": signer_response["agentList"][1]["Name"],
                "ID": signer_response["agentList"][1]["ID"],
            },
            {
                "Name": signer_response["agentList"][2]["Name"],
                "ID": signer_response["agentList"][2]["ID"],
            },
        ]

    AhjoResponseHandler.handle_ahjo_query_response(
        setting_name=setting_name, data=mock_response
    )

    mock_update_or_create.assert_called_once_with(
        name=setting_name,
        defaults={"data": data},
    )


def test_filter_decision_makers_invalid_response(invalid_decisionmaker_response):
    """Test filtering decision makers with incomplete data"""
    filtered_data = AhjoResponseHandler.filter_decision_makers(
        invalid_decisionmaker_response
    )

    # Verify no decision makers are returned due to missing fields
    assert len(filtered_data) == 0


def test_filter_decision_makers_missing_decisionmakers_key():
    """Test handling of response without decisionMakers key"""
    with pytest.raises(
        ValidationError, match="Missing decisionMakers field in response"
    ):
        AhjoResponseHandler.filter_decision_makers({})


@pytest.mark.parametrize(
    "setting_name, test_data",
    [
        (AhjoSettingName.DECISION_MAKER, {"Name": "Test Org", "ID": "ORG001"}),
        (AhjoSettingName.SIGNER, [{"Name": "Test Signer", "ID": "SIGN001"}]),
    ],
)
@patch("applications.models.AhjoSetting.objects.update_or_create")
def test_save_ahjo_setting(mock_update_or_create, setting_name, test_data):
    """Test saving decision makers to database"""

    AhjoResponseHandler._save_ahjo_setting(setting_name, test_data)

    mock_update_or_create.assert_called_once_with(
        name=setting_name, defaults={"data": test_data}
    )


@pytest.mark.parametrize(
    "setting_name, test_data",
    [
        (AhjoSettingName.DECISION_MAKER, {"Name": "Test Org", "ID": "ORG001"}),
        (
            AhjoSettingName.SIGNER,
            [
                {"Name": "Test Signer", "ID": "SIGN001"},
                {"Name": "Test Signer 2", "ID": "SIGN002"},
            ],
        ),
    ],
)
def test_save_ahjo_settings_database_error(setting_name, test_data):
    """Test handling of database save error"""
    with patch(
        "applications.models.AhjoSetting.objects.update_or_create",
        side_effect=Exception("Database Error"),
    ):
        with pytest.raises(
            ValidationError, match=f"Failed to save setting {setting_name} to database"
        ):
            AhjoResponseHandler._save_ahjo_setting(setting_name, test_data)


def test_parse_details_from_decision_response(
    ahjo_decision_detail_response, application_with_ahjo_decision
):
    response_handler = AhjoDecisionDetailsResponseHandler()
    details = response_handler._parse_details_from_decision_response(
        ahjo_decision_detail_response[0]
    )
    handler = application_with_ahjo_decision.calculation.handler

    assert isinstance(details, AhjoDecisionDetails)
    assert details.decision_maker_name == f"{handler.first_name} {handler.last_name}"
    assert (
        details.decision_maker_title
        == ahjo_decision_detail_response[0]["Organization"]["Name"]
    )
    assert isinstance(details.decision_date, datetime)
    assert details.decision_date == datetime.strptime(
        ahjo_decision_detail_response[0]["DateDecision"], "%Y-%m-%dT%H:%M:%S.%f"
    )
    assert (
        details.section_of_the_law == ahjo_decision_detail_response[0]["Section"] + " §"
    )


@pytest.mark.parametrize(
    "instalments_enabled,application_status,\
    expected_batch_status, expected_proposal_for_decision, expected_instalment_1_status, \
        expected_instalment_2_status",
    [
        (
            True,
            ApplicationStatus.REJECTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
            AhjoDecision.DECIDED_REJECTED,
            InstalmentStatus.WAITING,
            InstalmentStatus.WAITING,
        ),
        (
            True,
            ApplicationStatus.ACCEPTED,
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            AhjoDecision.DECIDED_ACCEPTED,
            InstalmentStatus.ACCEPTED,
            InstalmentStatus.WAITING,
        ),
    ],
)
def test_handle_details_request_success(
    ahjo_decision_detail_response,
    decided_application_with_decision_date,
    rejected_decided_application_with_decision_date,
    application_status,
    expected_batch_status,
    expected_proposal_for_decision,
    expected_instalment_1_status,
    expected_instalment_2_status,
    instalments_enabled,
    p2p_settings,
    settings,
):
    settings.PAYMENT_INSTALMENTS_ENABLED = instalments_enabled

    if application_status == ApplicationStatus.REJECTED:
        application = rejected_decided_application_with_decision_date
    else:
        application = decided_application_with_decision_date

    calculation = application.calculation
    calculation.instalments.all().delete()

    instalment_1 = Instalment.objects.create(
        calculation=calculation,
        status=InstalmentStatus.WAITING,
        instalment_number=1,
        amount=1000.00,
        amount_paid=1000.00,
    )
    instalment_2 = Instalment.objects.create(
        calculation=calculation,
        status=InstalmentStatus.WAITING,
        instalment_number=1,
        amount=500.00,
        amount_paid=1000.00,
    )

    response_handler = AhjoDecisionDetailsResponseHandler()
    success_text = response_handler.handle_details_request_success(
        application=application, response_dict=ahjo_decision_detail_response[0]
    )

    instalment_1.refresh_from_db()
    latest_ahjo_status = application.ahjo_status.latest()

    assert (
        success_text
        == f"Successfully received and updated decision details \
for application {application.id} and batch {application.batch.id} from Ahjo"
    )
    assert instalment_1.status == expected_instalment_1_status
    assert instalment_2.status == expected_instalment_2_status
    assert latest_ahjo_status.status == AhjoStatusEnum.DETAILS_RECEIVED_FROM_AHJO

    batch = application.batch
    assert batch.status == expected_batch_status
    assert batch.proposal_for_decision == expected_proposal_for_decision
