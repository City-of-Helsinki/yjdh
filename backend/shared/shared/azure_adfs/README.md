## YJDH Azure ADFS component

Azure ADFS authentication using the django library `django-auth-adfs`.

Custom logic was written for the callback view `HelsinkiOAuth2CallbackView` and the authentication backend `HelsinkiAdfsAuthCodeBackend`.

### How to set up

To start using this package, follow these steps:

1. Add `django-auth-adfs` to requirements and fill these environment variables:
    ```
    ADFS_CLIENT_ID=
    ADFS_CLIENT_SECRET=
    ADFS_TENANT_ID=
    ADFS_LOGIN_REDIRECT_URL=
    ADFS_LOGIN_REDIRECT_URL_FAILURE=
    ```

2. Add `"django_auth_adfs"` to `INSTALLED_APPS`:
    ```
    INSTALLED_APPS = [
        ...
        "django_auth_adfs",
        ...
    ]
    ```

3. Add `HelsinkiAdfsAuthCodeBackend` to `AUTHENTICATION_BACKENDS`:
    ```
    AUTHENTICATION_BACKENDS = (
        ...
        "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
        ...
    )
    ```

4. Add settings:
    ```
    LOGIN_URL = "django_auth_adfs:login"
    
    ADFS_CLIENT_ID = env.str("ADFS_CLIENT_ID") or "client_id"
    ADFS_CLIENT_SECRET = env.str("ADFS_CLIENT_SECRET") or "client_secret"
    ADFS_TENANT_ID = env.str("ADFS_TENANT_ID") or "tenant_id"
    
    AUTH_ADFS = {
        "AUDIENCE": ADFS_CLIENT_ID,
        "CLIENT_ID": ADFS_CLIENT_ID,
        "CLIENT_SECRET": ADFS_CLIENT_SECRET,
        "CLAIM_MAPPING": {"email": "email"},
        "USERNAME_CLAIM": "oid",
        "TENANT_ID": ADFS_TENANT_ID,
        "RELYING_PARTY_ID": ADFS_CLIENT_ID,
    }
    
    ADFS_LOGIN_REDIRECT_URL = env.str("ADFS_LOGIN_REDIRECT_URL")
    ADFS_LOGIN_REDIRECT_URL_FAILURE = env.str("ADFS_LOGIN_REDIRECT_URL_FAILURE")
    ```

5. The authentication flow can now be initiated from `/oauth2/login`

More information from [this guide](https://django-auth-adfs.readthedocs.io/en/latest/azure_ad_config_guide.html).

### Optional Django settings

`HANDLERS_GROUP_NAME`:
 - This group's membership signifies that user qualified as a handler at last ADFS login.
 - If set and a user group by this name exists then will be added to the logged in user's
   groups if the [user qualifies as a handler](https://github.com/City-of-Helsinki/yjdh/blob/9f0461309eb0057d28c0fd96c8f5b218cdd5ffea/backend/shared/shared/azure_adfs/auth.py#L190-L202)
   or removed if the user does not.

`ADFS_LOGIN_GROUP_NAME`:
 - This group's membership signifies that user has logged in using ADFS at some point.
 - A group with this name, or "ADFS login" if not set, will be added to the logged in
   user's groups.
