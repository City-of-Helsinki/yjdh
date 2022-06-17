import requests
from django.conf import settings
from requests import RequestException

from shared.helsinki_profile.exceptions import HelsinkiProfileException


class HelsinkiProfileClient:
    """
    Client for reading data from the Helsinki Profile GraphQL API

    See [AUTHENTICATION](https://github.com/City-of-Helsinki/yjdh/blob/develop/AUTHENTICATION.md) for details
    about the auth flow.

    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/6172606574/Full+Helsinki-profile+with+citizen+profile+and+API+authorization+support+features
    """

    def __init__(self):
        if not all(
            [
                settings.TUNNISTAMO_API_TOKENS_ENDPOINT,
                settings.HELSINKI_PROFILE_API_URL,
                settings.HELSINKI_PROFILE_SCOPE,
            ]
        ):
            raise HelsinkiProfileException(
                "HelsinkiProfileClient settings not configured."
            )

    def get_profile(self, oidc_access_token):
        """
        Reads user's profile from the API.

        Currently only reads the `nationalIdentificationNumber`, but can easily be modified to read
        other data if needed.

        :raises HelsinkiProfileException if profile cannot be succesfully read

        :return dict with queried values (value may be `None`)
        """
        payload = {
            "query": """
                query myProfile {
                    myProfile {
                        verifiedPersonalInformation {
                            nationalIdentificationNumber
                        }
                    }
                }
            """,
        }

        api_access_token = self.get_api_access_token(oidc_access_token)

        try:
            response = requests.post(
                settings.HELSINKI_PROFILE_API_URL,
                json=payload,
                timeout=10,
                verify=True,
                headers={"Authorization": "Bearer " + api_access_token},
            )
            response.raise_for_status()
        except RequestException as e:
            raise HelsinkiProfileException(str(e))

        profile_data = response.json()

        if "errors" in profile_data:
            raise HelsinkiProfileException(
                f"GraphQL error: {str(profile_data['errors'])}"
            )

        national_identification_number = (
            profile_data.get("data", {})
            .get("myProfile", {})
            .get("verifiedPersonalInformation", {})
            .get("nationalIdentificationNumber")
        )

        return {"user_ssn": national_identification_number}

    def get_api_access_token(self, oidc_access_token):
        """
        Exchanges OIDC access token for API access token
        """
        try:
            response = requests.get(
                settings.TUNNISTAMO_API_TOKENS_ENDPOINT,
                headers={"Authorization": f"Bearer {oidc_access_token}"},
            )
            response.raise_for_status()
            data = response.json()
        except RequestException as e:
            raise HelsinkiProfileException(str(e))

        if settings.HELSINKI_PROFILE_SCOPE not in data:
            raise HelsinkiProfileException(
                "Could not obtain API access token, check setting HELSINKI_PROFILE_SCOPE"
            )
        return data[settings.HELSINKI_PROFILE_SCOPE]
