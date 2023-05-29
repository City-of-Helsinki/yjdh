import logging
from urllib.parse import urlencode
from uuid import uuid4

import requests
from django.conf import settings
from django.contrib import auth
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError

from shared.helsinki_profile.exceptions import HelsinkiProfileException
from shared.helsinki_profile.hp_client import HelsinkiProfileClient
from shared.oidc.utils import (
    get_checksum_header,
    get_userinfo,
    store_token_info_in_eauth_session,
)

logger = logging.getLogger(__name__)


class EauthAuthenticationRequestView(View):
    """
    Eauth client authentication HTTP endpoint

    See [backend/README.md](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/README.md) for details
    about the auth flow.

    Docs that describe the flow (only in Finnish):
    https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/592d774503f6d100018db5dd
    """

    http_method_names = ["get"]

    def login_failure(self):
        return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL_FAILURE)

    def register_user(self, person_id):
        """
        Docs of this method (only in Finnish):
        Search for "Web API -session aloitus eli rekisteröintipyyntö"
        https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/592d774503f6d100018db5dd
        """
        request_id = uuid4()
        print("REGISTER USER HAS PERSON ID", person_id)
        path = f"/service/ypa/user/register/{settings.EAUTHORIZATIONS_CLIENT_ID}/{person_id}?requestId={request_id}"

        checksum_header = get_checksum_header(path)

        response = requests.get(
            settings.EAUTHORIZATIONS_BASE_URL + path,
            headers={
                "X-AsiointivaltuudetAuthorization": checksum_header,
            },
        )
        print("")
        print("")
        print("SUOMIFI RESPONSE FROM REGISTER_USER", response)
        print("")
        print("")
        print("")
        response.raise_for_status()
        return response.json()

    def get(self, request):
        """Eauth client authentication initialization HTTP endpoint

        NOTE: We should avoid raising exceptions from the method, because it results in user's auth flow
        ending on Django's 500 error page. We should instead call `self.login_failure()` to redirect the
        user to the login error page in the UI.
        """

        print("")
        print("")
        print("")
        print("START AUTH; REQUEST", request.__dict__)
        print("")
        print("")
        print("")

        suomifi_enabled = getattr(settings, "NEXT_PUBLIC_ENABLE_SUOMIFI", False)
        if suomifi_enabled:
            print("SSN FROM SUOMI_FI ENABLED")

            # Suomi.fi SAML authentication has been enabled
            print("REQUEST SSN FROM SAML SESSION")
            user_ssn = request.saml_session.get("national_id_num")
            if not user_ssn:
                return self.login_failure()
        else:
            print("SSN FROM SUOMI_FI DISABLED")

            if not request.session.get("oidc_access_token"):
                return self.login_failure()

            print("REQUEST SSN FROM OIDC USERINFO SESSION")
            user_info = get_userinfo(request)
            user_ssn = user_info.get("national_id_num")

            # When authenticating via Tunnistamo, we need to call Helsinki Profile GraphQL API
            if user_ssn is None:
                print("REQUEST SSN FROM GRAPHQL")
                try:
                    profile = HelsinkiProfileClient().get_profile(
                        request.session.get("oidc_access_token")
                    )
                except HelsinkiProfileException as e:
                    logger.warning(
                        f"Reading nationalIdentificationNumber from Helsinki Profile API failed: {str(e)}"
                    )
                    return self.login_failure()
                user_ssn = profile["user_ssn"]
                print("SET SSN FROM GRAPHQL")

        print("GOT SSN; IT'S VALUE IS", user_ssn, user_ssn.__class__)

        if user_ssn is None:
            print(" ### SSN IS NONE; WE ALREADY CALLED GRAPHQL !! PANIC!!!")
            logger.warning(
                "Cannot use eauthorizations API due to missing nationalIdentificationNumber"
            )
            return self.login_failure()
        print("")
        print("")
        print("")

        register_info = self.register_user(user_ssn)

        session_id = register_info.get("sessionId")
        user_id = register_info.get("userId")
        print("REGISTER_INFO OK! SESSION, USER ID", session_id, user_id)
        print("INIT EAUTH_SESSION ", session_id, user_id)

        store_token_info_in_eauth_session(request, {"id_token": session_id})
        print("SESSION STORED OK, START EAUTH AUTHORIZATION")
        auth_url = settings.EAUTHORIZATIONS_BASE_URL + "/oauth/authorize"

        params = {
            "client_id": settings.EAUTHORIZATIONS_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": request.build_absolute_uri(
                reverse("eauth_authentication_callback")
            ).replace("http://", "https://"),
            "user": user_id,
        }

        print("PARAMS:", params)

        lang = request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
        if lang:
            params["lang"] = lang

        query = urlencode(params)

        redirect_url = "{url}?{query}".format(url=auth_url, query=query)
        print("REDIRECT URL:", redirect_url)
        print("")
        print("")
        print("")

        return HttpResponseRedirect(redirect_url)


class EauthAuthenticationCallbackView(View):
    """Eauth client callback HTTP endpoint"""

    http_method_names = ["get"]

    def login_success(self):
        url = settings.LOGIN_REDIRECT_URL

        lang = self.request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
        if lang:
            url = f"{url}/{lang}/"

        return HttpResponseRedirect(url)

    def login_failure(self):
        url, error_path = settings.LOGIN_REDIRECT_URL_FAILURE.rsplit("/", 1)

        lang = self.request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
        if lang:
            url = f"{url}/{lang}/{error_path}"

        return HttpResponseRedirect(url)

    def get_token_info(self, code):
        print(
            "START POST TO eauth_authentication_callback",
            settings.EAUTHORIZATIONS_CLIENT_ID,
            settings.EAUTHORIZATIONS_API_OAUTH_SECRET,
            (settings.EAUTHORIZATIONS_BASE_URL + "/oauth/token"),
        )
        """Return token object as a dictionary."""
        auth_header = HTTPBasicAuth(
            settings.EAUTHORIZATIONS_CLIENT_ID,
            settings.EAUTHORIZATIONS_API_OAUTH_SECRET,
        )

        token_endpoint_url = settings.EAUTHORIZATIONS_BASE_URL + "/oauth/token"

        params = {
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.request.build_absolute_uri(
                reverse("eauth_authentication_callback")
            ).replace("http://", "https://"),
        }
        query = urlencode(params)

        print("PARAMS:", params)

        token_url = "{url}?{query}".format(url=token_endpoint_url, query=query)
        response = requests.post(
            token_url,
            auth=auth_header,
        )
        response.raise_for_status()

        return response.json()

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        print("")
        print("")
        print("")

        """!!! Eauth client authentication callback HTTP endpoint !!!"""
        print("Eauth client authentication callback HTTP endpoint")
        if request.GET.get("error"):
            if request.user.is_authenticated:
                auth.logout(request)
            assert not request.user.is_authenticated
            logger.error(str(request.GET["error"]))
        elif "code" in request.GET:
            try:
                token_info = self.get_token_info(request.GET["code"])
                print("TOKEN_INFO", token_info)
                store_token_info_in_eauth_session(request, token_info)

                # Store organization roles in session
                from shared.oidc.utils import request_organization_roles

                request_organization_roles(request)
            except HTTPError as e:
                logger.error(str(e))
                return self.login_failure()
            return self.login_success()
        return self.login_failure()
