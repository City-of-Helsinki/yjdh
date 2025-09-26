from enum import Enum, auto
from urllib.parse import urljoin

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from rest_framework.reverse import reverse


def handler_403_url():
    """
    Get handlers' 403 (i.e. Forbidden) URL.

    :return: URL for handlers' 403 page.
    """
    return urljoin(settings.HANDLER_URL, "/fi/403")


def handler_create_application_without_ssn_url():
    """
    Get handlers' URL "create youth application without social security number"
    page URL.

    :return: URL for handlers' "create youth application without social
        security number" page.
    """
    return urljoin(settings.HANDLER_URL, "/create-application-without-ssn")


def handler_youth_application_processing_url(youth_application_pk):
    """
    Get handlers' youth application processing URL.

    :param youth_application_pk: Youth application's primary key.
    :return: URL for processing the youth application.
    """
    return urljoin(settings.HANDLER_URL, f"/?id={youth_application_pk}")


def get_list_url():
    """
    Get youth application list URL.

    :return: URL for youth application list. Can be used for posting new youth
        applications.
    """
    return reverse("v1:youthapplication-list")


def get_create_without_ssn_url():
    """
    Get backend's URL for creating a youth application without social security
    number.

    :return: Backend's URL for creating a youth application without social
        security number.
    """
    return reverse("v1:youthapplication-create-without-ssn")


def reverse_youth_application_action(action, pk):
    """
    Reverse youth application's action URL.

    :param action: Action to reverse, e.g. "accept", "activate", "additional-
        info", "detail", "process", "reject"
    :param pk: Youth application's primary key.
    :return: URL for the given youth application's given action.
    """
    return reverse(f"v1:youthapplication-{action}", kwargs={"pk": pk})


def get_activation_url(pk):
    """
    Get youth application's activation URL.

    :param pk: Youth application's primary key.
    :return: URL for activating the youth application.
    """
    return reverse_youth_application_action("activate", pk)


def get_detail_url(pk):
    """
    Get youth application's detail info URL.

    :param pk: Youth application's primary key.
    :return: URL for viewing the youth application's detail info.
    """
    return reverse_youth_application_action("detail", pk)


def get_processing_url(pk):
    """
    Get youth application's processing URL in the backend, not in the handlers'
    UI.

    :param pk: Youth application's primary key.
    :return: URL for processing the youth application.
    """
    return reverse_youth_application_action("process", pk)


def get_accept_url(pk):
    """
    Get youth application's accept URL.

    :param pk: Youth application's primary key.
    :return: URL for accepting the youth application.
    """
    return reverse_youth_application_action("accept", pk)


def get_additional_info_url(pk):
    """
    Get youth application's additional info URL.

    :param pk: Youth application's primary key.
    :return: URL for providing additional info for the youth application.
    """
    return reverse_youth_application_action("additional-info", pk)


def get_reject_url(pk):
    """
    Get youth application's reject URL.

    :param pk: Youth application's primary key.
    :return: URL for rejecting the youth application.
    """
    return reverse_youth_application_action("reject", pk)


def get_django_adfs_login_url(redirect_url):
    """
    Get Django ADFS login URL.

    :param redirect_url: URL to redirect to after successful login.
    :return: URL for Django ADFS login with the redirect URL as the "next"
        parameter.
    """
    return "{login_url}?{redirect_field_name}={redirect_url}".format(
        login_url=reverse("django_auth_adfs:login"),
        redirect_field_name=REDIRECT_FIELD_NAME,
        redirect_url=redirect_url,
    )


class RedirectTo(Enum):
    """
    Enum for redirecting to different URLs.

    Enum values:
    - adfs_login: Redirect to Django ADFS login.
    - handler_403: Redirect to handlers' 403 page.
    - handler_process: Redirect to handlers' youth application processing page.
    """

    adfs_login = auto()
    handler_403 = auto()
    handler_process = auto()

    @staticmethod
    def get_redirect_url(redirect_to, youth_application_action, youth_application_pk):
        """
        Get redirect URL based on the given redirect enum value.

        :param redirect_to: Enum value for redirecting to different URLs.
        :param youth_application_action: Action to reverse, e.g. "accept",
            "activate", "additional-info", "detail", "process", "reject"
        :param youth_application_pk: Youth application's primary key.
        :return: URL for the given redirect enum value.
        """
        return {
            RedirectTo.adfs_login: get_django_adfs_login_url(
                redirect_url=reverse_youth_application_action(
                    youth_application_action, youth_application_pk
                )
            ),
            RedirectTo.handler_403: handler_403_url(),
            RedirectTo.handler_process: handler_youth_application_processing_url(
                youth_application_pk
            ),
        }[redirect_to]
