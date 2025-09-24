import pytest
from rest_framework.reverse import reverse

# name_value = "ahjo_decision_maker"
# settings_route = reverse("ahjo-setting-detail", args=[name_value])


def test_get_decision_maker_ahjo_setting_for_applicant(api_client):
    response = api_client.get(
        reverse("ahjo-setting-detail", args=["ahjo_decision_maker"])
    )

    assert response.status_code == 403


@pytest.mark.parametrize("setting_name", ["ahjo_decision_maker", "ahjo_signer"])
def test_get_ahjo_setting_for_handler(
    handler_api_client, decision_maker_settings, setting_name, signer_settings
):
    settings_route = reverse("ahjo-setting-detail", args=[setting_name])
    response = handler_api_client.get(settings_route)

    assert response.status_code == 200
    assert len(response.data["data"]) == 2
    if setting_name == "ahjo_decision_maker":
        assert (
            response.data["data"][0]["Name"] == decision_maker_settings.data[0]["Name"]
        )
        assert response.data["data"][0]["ID"] == decision_maker_settings.data[0]["ID"]
        assert (
            response.data["data"][1]["Name"] == decision_maker_settings.data[1]["Name"]
        )
        assert response.data["data"][1]["ID"] == decision_maker_settings.data[1]["ID"]
    if setting_name == "ahjo_signer":
        assert response.data["data"][0]["Name"] == signer_settings.data[0]["Name"]
        assert response.data["data"][0]["ID"] == signer_settings.data[0]["ID"]
        assert response.data["data"][1]["Name"] == signer_settings.data[1]["Name"]
        assert response.data["data"][1]["ID"] == signer_settings.data[1]["ID"]
