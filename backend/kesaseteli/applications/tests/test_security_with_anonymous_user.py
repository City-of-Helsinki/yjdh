import pytest
from django.test import override_settings
from rest_framework import status
from rest_framework.reverse import reverse

from common.tests.factories import AdditionalInfoRequestedYouthApplicationFactory
from common.tests.utils import set_company_business_id_to_client


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_school_list_openly_accessible_to_anonymous_user(client):
    """
    Test that the school list is openly accessible to anonymous users.

    NOTE:
        This endpoint is open to anyone on purpose to be able to show the school list in
        the youth application's form. The school list is public information.
    """
    response = client.get(reverse("school-list"))
    assert response.status_code == status.HTTP_200_OK
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_company_forbidden_to_anonymous_user(client, company):
    """
    Test that the company endpoint is forbidden to an anonymous user.
    """
    set_company_business_id_to_client(company, client)
    response = client.get(reverse("company"))
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_status_openly_accessible_to_anonymous_user(client):
    """
    Test that youth application's status endpoint is openly accessible to anonymous
    users and returns only the single queried youth application's status and nothing
    else.

    NOTE:
        The youth application's status endpoint is open to everyone and can be used to
        see the status and existence/inexistence of any youth application in the system.
        To do this the user must know the queried youth application's ID value, which is
        not public information and which is supposed to be random as it is an UUID4.
        This was a conscious decision as the status is relatively harmless information,
        and it's useful in the additional info page which doesn't require any
        authentication or authorization to use.
    """
    app = AdditionalInfoRequestedYouthApplicationFactory()
    status_url = reverse("v1:youthapplication-status", kwargs={"pk": app.id})
    response = client.get(status_url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"status": "additional_information_requested"}
    assert response.wsgi_request.user.is_anonymous
