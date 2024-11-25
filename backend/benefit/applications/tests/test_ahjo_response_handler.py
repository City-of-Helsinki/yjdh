from unittest.mock import patch

import pytest
from django.core.exceptions import ValidationError

from applications.services.ahjo.enums import AhjoSettingName
from applications.services.ahjo_integration import AhjoResponseHandler


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


@pytest.mark.parametrize(
    "setting_name, test_data",
    [
        (AhjoSettingName.DECISION_MAKER, {"Name": "Test Org", "ID": "ORG001"}),
    ],
)
@patch("applications.models.AhjoSetting.objects.update_or_create")
def test_handle_ahjo_query_response_successful(
    mock_update_or_create, decisionmaker_response, setting_name, test_data
):
    """Test successful handling of decision maker response"""
    mock_response = decisionmaker_response[1]

    AhjoResponseHandler.handle_ahjo_query_response(setting_name, mock_response)

    mock_update_or_create.assert_called_once_with(
        name=setting_name,
        defaults={
            "data": [
                {
                    "Name": decisionmaker_response[1]["decisionMakers"][0][
                        "Organization"
                    ]["Name"],
                    "ID": decisionmaker_response[1]["decisionMakers"][0][
                        "Organization"
                    ]["ID"],
                },
                {
                    "Name": decisionmaker_response[1]["decisionMakers"][1][
                        "Organization"
                    ]["Name"],
                    "ID": decisionmaker_response[1]["decisionMakers"][1][
                        "Organization"
                    ]["ID"],
                },
            ]
        },
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
