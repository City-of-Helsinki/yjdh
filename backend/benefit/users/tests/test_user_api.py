from rest_framework.reverse import reverse

from common.tests.conftest import get_client_user


def test_applications_unauthorized(api_client, application):
    response = api_client.get(reverse("users-me"))
    user = get_client_user(api_client)
    assert response.status_code == 200
    assert response.data["id"] == str(user.id)
    assert len(response.data["csrf_token"]) > 0
