import json
from uuid import uuid4

import pytest
from django.http import HttpResponseRedirect
from django.test import override_settings
from rest_framework import status
from rest_framework.exceptions import ErrorDetail
from rest_framework.renderers import JSONRenderer
from rest_framework.reverse import reverse

from common.tests.factories import (
    AcceptedYouthApplicationFactory,
    AdditionalInfoRequestedYouthApplicationFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
)
from common.tests.utils import set_company_business_id_to_client
from common.urls import get_django_adfs_login_url

# Headers to be used in requests to accept only application/json responses
HEADERS_ACCEPT_APPLICATION_JSON = {"Accept": "application/json"}


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_school_list_openly_accessible_to_anonymous_user(client):
    """
    Test that the school list is openly accessible to anonymous users.

    NOTE:
        This endpoint is open to anyone on purpose to be able to show the school list in
        the youth application's form. The school list is public information.
    """
    response = client.get(
        reverse("school-list"), headers=HEADERS_ACCEPT_APPLICATION_JSON
    )
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_company_forbidden_to_anonymous_user(client, company):
    """
    Test that the company endpoint is forbidden to an anonymous user.
    """
    set_company_business_id_to_client(company, client)
    response = client.get(reverse("company"), headers=HEADERS_ACCEPT_APPLICATION_JSON)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert isinstance(response.accepted_renderer, JSONRenderer)
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
    response = client.get(status_url, headers=HEADERS_ACCEPT_APPLICATION_JSON)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == {"status": "additional_information_requested"}
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_applications_list_get_method_not_allowed_to_anonymous_user(client):
    """
    Test that using GET on youth applications' list endpoint returns method not allowed
    to anonymous users.
    """
    list_url = reverse("v1:youthapplication-list")
    response = client.get(list_url, headers=HEADERS_ACCEPT_APPLICATION_JSON)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert response.data is None
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_api_root_get_forbidden_to_anonymous_user(client):
    """
    Test that using GET on API root is forbidden to anonymous users.
    """
    api_root_url = reverse("v1:api-root")
    response = client.get(api_root_url, headers=HEADERS_ACCEPT_APPLICATION_JSON)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data == {
        "detail": ErrorDetail(
            string="Autentikaatiotunnuksia ei annettu.",  # Default server language is Finnish
            code="not_authenticated",
        )
    }
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_fetch_employee_data_get_method_not_allowed_to_anonymous_user(
    client,
):
    """
    Test that using GET on youth application's fetch_employee_data endpoint returns
    method not allowed to anonymous users.
    """
    url = reverse("v1:youthapplication-fetch-employee-data")
    response = client.get(url, headers=HEADERS_ACCEPT_APPLICATION_JSON)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert response.data == {
        "detail": ErrorDetail(
            string='Metodi "GET" ei ole sallittu.',  # Default server language is Finnish
            code="method_not_allowed",
        )
    }
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_fetch_employee_data_post_forbidden_to_anonymous_user(client):
    """
    Test that using POST on youth application's fetch_employee_data endpoint is
    forbidden to anonymous users.
    """
    employer_summer_voucher = EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory()
    )
    AcceptedYouthApplicationFactory(
        last_name="Doe",
        youth_summer_voucher__summer_voucher_serial_number=123,
    )
    url = reverse("v1:youthapplication-fetch-employee-data")
    response = client.post(
        url,
        data={
            "employer_summer_voucher_id": str(employer_summer_voucher.id),
            "employee_name": "John Doe",
            "summer_voucher_serial_number": 123,
        },
        headers=HEADERS_ACCEPT_APPLICATION_JSON,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_create_without_ssn_get_method_not_allowed_to_anonymous_user(
    client,
):
    """
    Test that using GET on youth application's create_without_ssn endpoint returns
    method not allowed to anonymous users.
    """
    url = reverse("v1:youthapplication-create-without-ssn")
    response = client.get(url, headers=HEADERS_ACCEPT_APPLICATION_JSON)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert response.data == {
        "detail": ErrorDetail(
            string='Metodi "GET" ei ole sallittu.',  # Default server language is Finnish
            code="method_not_allowed",
        )
    }
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.django_db
def test_youth_application_create_without_ssn_post_redirects_anonymous_user_to_login(
    client,
):
    """
    Test that using POST on youth application's create_without_ssn endpoint
    redirects an anonymous user to a login page.
    """
    create_without_ssn_url = reverse("v1:youthapplication-create-without-ssn")
    response = client.post(
        create_without_ssn_url, data={}, headers=HEADERS_ACCEPT_APPLICATION_JSON
    )
    assert response.status_code == status.HTTP_302_FOUND
    assert isinstance(response, HttpResponseRedirect)
    assert response.url == get_django_adfs_login_url(
        redirect_url=create_without_ssn_url
    )
    assert response.wsgi_request.user.is_anonymous


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "endpoint_url",
    [
        reverse("school-list"),
        reverse("company"),
        reverse("v1:api-root"),
        reverse("v1:youthapplication-list"),
        reverse("v1:youthapplication-create-without-ssn"),
        reverse("v1:youthapplication-fetch-employee-data"),
        reverse("v1:youthapplication-status", kwargs={"pk": uuid4()}),
    ],
)
@pytest.mark.parametrize(
    "method",
    ["GET", "POST", "HEAD", "PATCH", "UPDATE", "DELETE", "PUT", "OPTIONS", "TRACE"],
)
@pytest.mark.django_db
@pytest.mark.xfail(reason="Browsable API is not yet disabled, but will be")
def test_not_acceptable_response_to_anonymous_user_requesting_html_from_endpoint(
    client, endpoint_url, method
):
    """
    Test that endpoints return 406 Not Acceptable response to anonymous user
    when asking for HTML type response (i.e. request header's "Accept" is "text/html").
    """
    response = client.generic(
        method=method,
        path=endpoint_url,
        headers={"Accept": "text/html"},
    )
    assert response.status_code == status.HTTP_406_NOT_ACCEPTABLE
    assert response.data == {
        "detail": ErrorDetail(
            string="Ei voitu vastata pyynnön Accept-otsakkeen mukaisesti.",  # Default server language is Finnish
            code="not_acceptable",
        ),
    }
    assert response.content == b"" or json.loads(response.content.decode("utf-8")) == {
        "detail": "Ei voitu vastata pyynnön Accept-otsakkeen mukaisesti."
    }
    assert isinstance(response.accepted_renderer, JSONRenderer)
    assert response.wsgi_request.user.is_anonymous
