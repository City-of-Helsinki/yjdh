from unittest.mock import patch

import pytest
from django.core.exceptions import ValidationError

from applications.services.ahjo.enums import AhjoSettingName
from applications.services.ahjo.setting_response_handler import AhjoResponseHandler


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
