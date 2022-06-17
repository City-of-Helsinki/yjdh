# Authentication in YJDH

The authentication setups used by YJDH projects are described in this document. The emphasis is on
short descriptions of the concrete flows with pointers to code.  

## Suomi.fi

All YJDH projects perform the following things:

* redirect the user to suomi.fi login and log successful logins to Django
* obtain user's national identification number (hetu, also `user_ssn` in code)
* use eauthorizations API to get user's company

The last step is the same for all, but for the previous each project has a different implementation

| Project | Flow                                                                   | Tools                            |
|---------|------------------------------------------------------------------------|----------------------------------|
| Benefit | OIDC flow via Tunnistus service (Helsinki Profile plain suomi.fi auth) | mozilla_django_oidc              |
| TET     | OIDC flow via Tunnistamo service + Helsinki Profile API                | mozilla_django_oidc, custom code |
| KS      | SAML flow with suomi.fi                                                | djangosaml2                      |

## OIDC flow with Helsinki Profile

* User clicks login button on UI, this redirects to [authenticate url of backend](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/oidc/urls.py#L52)
* This calls `settings.OIDC_OP_AUTHORIZATION_ENDPOINT` with essentially the following query parameters
  * `settings.OIDC_RP_CLIENT_ID` (needs to be configured in Auth Provider)
  * `settings.OIDC_RP_SCOPES` defines the user's details authorized to access
  * `redirect_uri` Auth provider redirects the user to this login
    * with `mozilla_django_oidc` this defaults to view with name [oidc_authentication_callback](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/oidc/urls.py#L59)
    * needs to be configured in Helsinki Profile
    * when testing in localhost, nginx proxy settings may cause the scheme to be `http` instead of `https`, which doesn't work
  * `code` is a server generated random string that the server uses to verify it initiated the login process
  * `settings.OIDC_RP_CLIENT_SECRET` is used by `mozilla_django_oidc` to verify the request
* After a successful return to the callback URL the user is logged in to Django with authentication keys stored in the user's session

The login process now continues to obtain user's company. After successful completion, the user's HTTP session has the key `organization_roles` set.

* The callback view redirects the user to view [eauth_authentication_init](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/oidc/urls.py#L85)
* Endpoint `settings.OIDC_OP_USER_ENDPOINT` is called to obtain user's national identification number
  * The data is present only for Tunnistus service
  * For Tunnistamo, we need to 
    * call `settings.TUNNISTAMO_API_TOKENS_ENDPOINT` to [exchange OIDC access token for API access token](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/helsinki_profile/hp_client.py#L67)
    * call `settings.HELSINKI_PROFILE_API_URL` with the access token [to get the national identification number](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/helsinki_profile/hp_client.py#L24)
* [register_user](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/oidc/views/eauth_views.py#L38) is called to initiate the process
  * user's national identification number is needed for this call
* The user is redirected to the eauthorizations service at `settings.EAUTHORIZATIONS_BASE_URL` to redirect the user to select the company
* The eauthorizations service redirects to view [eauth_authentication_callback](https://github.com/City-of-Helsinki/yjdh/blob/develop/backend/shared/shared/oidc/urls.py#L88)
  * This callback URL needs to be configured by DVV (e.g. https://localhost:8000/oidc/eauthorizations/callback/)
  * If there are errors, the user is logged out of Django and sent to login failed page 
  * The callback request is verified agains the eauthorizations service
  * The view sets `organization_roles` and redirects the user back to UI

[Sequence diagram](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/6207471868/Helsinki-profiili+suomi.fi+-valtuutus)

## Helsinki AD

TODO
