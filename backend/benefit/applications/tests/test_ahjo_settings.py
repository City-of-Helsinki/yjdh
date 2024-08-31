from rest_framework.reverse import reverse

settings_route = reverse("ahjo-setting-detail")


def test_get_decision_maker_ahjo_setting_for_applicant(api_client):
    response = api_client.get(settings_route)

    assert response.status_code == 403


def test_get_decision_maker_ahjo_setting_for_handler(
    handler_api_client, decision_maker_settings
):
    response = handler_api_client.get(settings_route)

    assert response.status_code == 200
    assert len(response.data["data"]) == 2
    assert response.data["data"][0]["Name"] == decision_maker_settings.data[0]["Name"]
    assert response.data["data"][0]["ID"] == decision_maker_settings.data[0]["ID"]
    assert response.data["data"][1]["Name"] == decision_maker_settings.data[1]["Name"]
    assert response.data["data"][1]["ID"] == decision_maker_settings.data[1]["ID"]
