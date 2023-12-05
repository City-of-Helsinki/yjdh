import os

import environ
import sentry_sdk
from corsheaders.defaults import default_headers
from django.utils.translation import gettext_lazy as _
from sentry_sdk.integrations.django import DjangoIntegration

from shared.service_bus.enums import YtjOrganizationCode

checkout_dir = environ.Path(__file__) - 2
assert os.path.exists(checkout_dir("manage.py"))

parent_dir = checkout_dir.path("..")
if os.path.isdir(parent_dir("etc")):
    env_file = parent_dir("etc/env")
    default_var_root = environ.Path(parent_dir("var"))
else:
    env_file = checkout_dir(".env")
    default_var_root = environ.Path(checkout_dir("var"))

env = environ.Env(
    API_BASE_URL=(str, "https://localhost:8000"),
    DEBUG=(bool, False),
    SECRET_KEY=(str, ""),
    MEDIA_ROOT=(environ.Path(), default_var_root("media")),
    STATIC_ROOT=(environ.Path(), default_var_root("static")),
    MEDIA_URL=(str, "/media/"),
    STATIC_URL=(str, "/static/"),
    ALLOWED_HOSTS=(list, ["*"]),
    USE_X_FORWARDED_HOST=(bool, False),
    DATABASE_URL=(
        str,
        "postgres://benefit:benefit@benefit-db:5434/benefit",
    ),
    CACHE_URL=(str, "locmemcache://"),
    MAIL_MAILGUN_KEY=(str, ""),
    MAIL_MAILGUN_DOMAIN=(str, ""),
    MAIL_MAILGUN_API=(str, ""),
    SENTRY_DSN=(str, ""),
    SENTRY_ENVIRONMENT=(str, ""),
    SENTRY_ATTACH_STACKTRACE=(bool, False),
    SENTRY_MAX_BREADCRUMBS=(int, 0),
    SENTRY_REQUEST_BODIES=(str, "never"),
    SENTRY_SEND_DEFAULT_PII=(bool, False),
    SENTRY_WITH_LOCALS=(bool, False),
    SENTRY_RELEASE=(str, ""),
    CORS_ALLOWED_ORIGINS=(list, []),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    CSRF_COOKIE_DOMAIN=(str, "localhost"),
    CSRF_TRUSTED_ORIGINS=(list, ["localhost:3000", "localhost:3100"]),
    CSRF_COOKIE_NAME=(str, "yjdhcsrftoken"),
    YTJ_BASE_URL=(str, "https://avoindata.prh.fi"),
    YTJ_TIMEOUT=(int, 30),
    # Source: YTJ-rajapinnan koodiston kuvaus, available at https://liityntakatalogi.suomi.fi/dataset/xroadytj-services
    # file: suomi_fi_palveluvayla_ytj_rajapinta_koodistot_v1_4.xlsx
    ASSOCIATION_FORM_CODES=(
        str,
        "18,21,25,29,31,32,35,38,39,4,44,45,46,47,50,58,6,71,9,90,94999",
    ),
    NEXT_PUBLIC_MOCK_FLAG=(bool, False),
    # Random 32 bytes AES key, for testing purpose only, DO NOT use the same value in staging/production
    # Always override this value from env variables
    ENCRYPTION_KEY=(
        str,
        "f164ec6bd6fbc4aef5647abc15199da0f9badcc1d2127bde2087ae0d794a9a0b",
    ),
    SOCIAL_SECURITY_NUMBER_HASH_KEY=(
        str,
        "ee235e39ebc238035a6264c063dd829d4b6d2270604b57ee1f463e676ec44669",
    ),
    EMPLOYEE_FIRST_NAME_HASH_KEY=(
        str,
        "02c5b8605cd4f9c188eee422209069b7bd3a607f0ae0a166eab0da223d1b6735",
    ),
    EMPLOYEE_LAST_NAME_HASH_KEY=(
        str,
        "af1b5a67d11197865a731c26bf9659716b9ded71c2802b4363856fe613b6b527",
    ),
    PREVIOUS_BENEFITS_SOCIAL_SECURITY_NUMBER_HASH_KEY=(
        str,
        "d5c8a2743d726a33dbd637fac39d6f0712dcee4af36142fb4fb15afa17b1d9bf",
    ),
    SESSION_COOKIE_AGE=(int, 60 * 60 * 2),
    TOKEN_AUTH_ACCEPTED_AUDIENCE=(str, "https://api.hel.fi/auth/helsinkibenefit"),
    TOKEN_AUTH_ACCEPTED_SCOPE_PREFIX=(str, "helsinkibenefit"),
    TOKEN_AUTH_AUTHSERVER_URL=(str, "https://api.hel.fi/sso/openid"),
    TOKEN_AUTH_FIELD_FOR_CONSENTS=(str, "https://api.hel.fi/auth"),
    TOKEN_AUTH_REQUIRE_SCOPE_PREFIX=(bool, True),
    OIDC_LEEWAY=(int, 60 * 60 * 2),
    OIDC_RP_CLIENT_ID=(str, ""),
    OIDC_RP_CLIENT_SECRET=(str, ""),
    OIDC_OP_BASE_URL=(str, ""),
    OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO=(bool, True),
    OIDC_OP_LOGOUT_CALLBACK_URL=(str, "/"),
    TUNNISTAMO_API_TOKENS_ENDPOINT=(str, ""),
    HELSINKI_PROFILE_SCOPE=(str, "https://api.hel.fi/auth/helsinkiprofile"),
    HELSINKI_PROFILE_API_URL=(str, "https://api.hel.fi/profiili/graphql/"),
    LOGIN_REDIRECT_URL=(str, "/"),
    LOGIN_REDIRECT_URL_FAILURE=(str, "/"),
    LOGOUT_REDIRECT_URL=(str, "/"),
    ADFS_LOGIN_REDIRECT_URL=(str, "/"),
    ADFS_LOGIN_REDIRECT_URL_FAILURE=(str, "/"),
    EAUTHORIZATIONS_BASE_URL=(str, "https://asiointivaltuustarkastus.test.suomi.fi"),
    EAUTHORIZATIONS_CLIENT_ID=(str, "sample_client_id"),
    EAUTHORIZATIONS_CLIENT_SECRET=(str, ""),
    EAUTHORIZATIONS_API_OAUTH_SECRET=(str, ""),
    ADFS_CLIENT_ID=(str, "client_id"),
    ADFS_CLIENT_SECRET=(str, "client_secret"),
    ADFS_TENANT_ID=(str, "tenant_id"),
    ADFS_CONTROLLER_GROUP_UUIDS=(list, []),
    DEFAULT_FILE_STORAGE=(str, "django.core.files.storage.FileSystemStorage"),
    AZURE_ACCOUNT_NAME=(str, ""),
    AZURE_ACCOUNT_KEY=(str, ""),
    AZURE_CONTAINER=(str, ""),
    AZURE_URL_EXPIRATION_SECS=(int, 900),
    MINIMUM_WORKING_HOURS_PER_WEEK=(int, 18),
    AUDIT_LOG_ORIGIN=(str, "helsinki-benefit-api"),
    ELASTICSEARCH_APP_AUDIT_LOG_INDEX=(str, "helsinki_benefit_audit_log"),
    ELASTICSEARCH_HOST=(str, ""),
    ELASTICSEARCH_PORT=(int, 9200),
    ELASTICSEARCH_USERNAME=(str, ""),
    ELASTICSEARCH_PASSWORD=(str, ""),
    CLEAR_AUDIT_LOG_ENTRIES=(bool, False),
    ENABLE_SEND_AUDIT_LOG=(bool, False),
    EMAIL_USE_TLS=(bool, False),
    EMAIL_HOST=(str, "relay.hel.fi"),
    EMAIL_HOST_USER=(str, ""),
    EMAIL_HOST_PASSWORD=(str, ""),
    EMAIL_PORT=(int, 25),
    EMAIL_TIMEOUT=(int, 15),
    DEFAULT_FROM_EMAIL=(str, "Helsinki-lisä <helsinkilisa@hel.fi>"),
    WKHTMLTOPDF_BIN=(str, "/usr/bin/wkhtmltopdf"),
    DUMMY_COMPANY_FORM_CODE=(
        int,
        YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT,
    ),
    TERMS_OF_SERVICE_SESSION_KEY=(str, "_tos_session"),
    ENABLE_DEBUG_ENV=(bool, False),
    TALPA_ROBOT_AUTH_CREDENTIAL=(str, "username:password"),
    DISABLE_TOS_APPROVAL_CHECK=(bool, False),
    YRTTI_BASE_URL=(
        str,
        "https://yrtti-integration-test.agw.arodevtest.hel.fi/api",
    ),
    YRTTI_AUTH_USERNAME=(str, "sample_username"),
    YRTTI_AUTH_PASSWORD=(str, "sample_password"),
    YRTTI_TIMEOUT=(int, 30),
    YRTTI_SEARCH_LIMIT=(int, 10),
    YRTTI_DISABLE=(bool, False),
    SERVICE_BUS_BASE_URL=(
        str,
        "https://ytj-integration-test.agw.arodevtest.hel.fi/api",
    ),
    SERVICE_BUS_AUTH_USERNAME=(str, "sample_username"),
    SERVICE_BUS_AUTH_PASSWORD=(str, "sample_password"),
    SERVICE_BUS_TIMEOUT=(int, 30),
    SERVICE_BUS_SEARCH_LIMIT=(int, 10),
    GDPR_API_QUERY_SCOPE=(str, "helsinkibenefit.gdprquery"),
    GDPR_API_DELETE_SCOPE=(str, "helsinkibenefit.gdprdelete"),
    # For AHJO Rest API authentication
    AHJO_CLIENT_ID=(str, ""),
    AHJO_CLIENT_SECRET=(str, ""),
    AHJO_TOKEN_URL=(str, "https://johdontyopoytahyte.hel.fi/ids4/connect/token"),
    AHJO_REST_API_URL=(str, "https://ahjohyte.hel.fi:9802/ahjorest/v1"),
    AHJO_REDIRECT_URL=(str, "https://helsinkilisa/dummyredirect.html"),
    AHJO_ALLOWED_IP=(str, ""),
)
if os.path.exists(env_file):
    env.read_env(env_file)

os.environ["HTTPS"] = "on"

API_BASE_URL = env.str("API_BASE_URL")

BASE_DIR = str(checkout_dir)

DEBUG = env.bool("DEBUG")
SECRET_KEY = env.str("SECRET_KEY")
if DEBUG and not SECRET_KEY:
    SECRET_KEY = "xxx"
ENCRYPTION_KEY = env.str("ENCRYPTION_KEY")
SOCIAL_SECURITY_NUMBER_HASH_KEY = env.str("SOCIAL_SECURITY_NUMBER_HASH_KEY")

EMPLOYEE_FIRST_NAME_HASH_KEY = env.str("EMPLOYEE_FIRST_NAME_HASH_KEY")
EMPLOYEE_LAST_NAME_HASH_KEY = env.str("EMPLOYEE_LAST_NAME_HASH_KEY")

PREVIOUS_BENEFITS_SOCIAL_SECURITY_NUMBER_HASH_KEY = env.str(
    "PREVIOUS_BENEFITS_SOCIAL_SECURITY_NUMBER_HASH_KEY"
)

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
USE_X_FORWARDED_HOST = env.bool("USE_X_FORWARDED_HOST")

DATABASES = {"default": env.db()}

CACHES = {"default": env.cache()}

sentry_sdk.init(
    attach_stacktrace=env.bool("SENTRY_ATTACH_STACKTRACE"),
    max_breadcrumbs=env.int("SENTRY_MAX_BREADCRUMBS"),
    request_bodies=env.str("SENTRY_REQUEST_BODIES"),
    send_default_pii=env.bool("SENTRY_SEND_DEFAULT_PII"),
    with_locals=env.bool("SENTRY_WITH_LOCALS"),
    dsn=env.str("SENTRY_DSN"),
    release=env.str("SENTRY_RELEASE"),
    environment=env.str("SENTRY_ENVIRONMENT"),
    integrations=[DjangoIntegration()],
)

MEDIA_ROOT = env("MEDIA_ROOT")
STATIC_ROOT = env("STATIC_ROOT")
MEDIA_URL = env.str("MEDIA_URL")
STATIC_URL = env.str("STATIC_URL")

ROOT_URLCONF = "helsinkibenefit.urls"
WSGI_APPLICATION = "helsinkibenefit.wsgi.application"

LANGUAGE_CODE = "fi"
LANGUAGES = (("fi", _("Finnish")), ("en", _("English")), ("sv", _("Swedish")))
TIME_ZONE = "Europe/Helsinki"
USE_I18N = True
USE_L10N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

LOCALE_PATHS = (os.path.join(BASE_DIR, "locale"),)

INSTALLED_APPS = [
    # shared apps
    "shared.oidc",
    "shared.audit_log",
    # local apps
    "users.apps.AppConfig",
    "companies",
    "applications.apps.AppConfig",
    "terms.apps.AppConfig",
    "calculator.apps.AppConfig",
    "messages",
    # libraries
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "drf_spectacular",
    "phonenumber_field",
    "django_extensions",
    "encrypted_fields",
    "mozilla_django_oidc",
    "django_auth_adfs",
    "helusers.apps.HelusersConfig",
]

AUTH_USER_MODEL = "users.User"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS")
EMAIL_HOST = env.str("EMAIL_HOST")
EMAIL_HOST_USER = env.str("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env.str("EMAIL_HOST_PASSWORD")
EMAIL_PORT = env.int("EMAIL_PORT")
EMAIL_TIMEOUT = env.int("EMAIL_TIMEOUT")
DEFAULT_FROM_EMAIL = env.str("DEFAULT_FROM_EMAIL")

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS")
CSRF_COOKIE_DOMAIN = env.str("CSRF_COOKIE_DOMAIN")
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS")
CSRF_COOKIE_NAME = env.str("CSRF_COOKIE_NAME")
CSRF_COOKIE_SECURE = True
CSRF_USE_SESSIONS = True

# Audit logging
AUDIT_LOG_ORIGIN = env.str("AUDIT_LOG_ORIGIN")
CLEAR_AUDIT_LOG_ENTRIES = env.bool("CLEAR_AUDIT_LOG_ENTRIES")
ELASTICSEARCH_APP_AUDIT_LOG_INDEX = env("ELASTICSEARCH_APP_AUDIT_LOG_INDEX")
ELASTICSEARCH_HOST = env("ELASTICSEARCH_HOST")
ELASTICSEARCH_PORT = env("ELASTICSEARCH_PORT")
ELASTICSEARCH_USERNAME = env("ELASTICSEARCH_USERNAME")
ELASTICSEARCH_PASSWORD = env("ELASTICSEARCH_PASSWORD")
ENABLE_SEND_AUDIT_LOG = env("ENABLE_SEND_AUDIT_LOG")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {"django": {"handlers": ["console"], "level": "INFO"}},
}

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "common.permissions.BFIsAuthenticated",
    ],
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}  # TODO: Replace with actual authentication & permissions.

SPECTACULAR_SETTINGS = {
    "TITLE": "Helsinki Benefit API",
    "ENUM_NAME_OVERRIDES": {
        "AvailableBenefitTypesEnum": "applications.enums.BenefitType",
    },
    "DESCRIPTION": """REST API for Helsinki Benefit application management

# Authentication methods
<SecurityDefinitions />
""",
    "VERSION": "0.0.1",
    "EXTERNAL_DOCS": {
        "description": "Helsinki benefit / YJDH repository in GitHub",
        "url": "https://github.com/City-of-Helsinki/yjdh",
    },
}

PHONENUMBER_DB_FORMAT = "NATIONAL"
PHONENUMBER_DEFAULT_REGION = "FI"

YTJ_BASE_URL = env.str("YTJ_BASE_URL")

ASSOCIATION_FORM_CODES = [
    int(value) for value in env.str("ASSOCIATION_FORM_CODES").split(",")
]
YTJ_TIMEOUT = env.int("YTJ_TIMEOUT")

# Mock flag for testing purposes
NEXT_PUBLIC_MOCK_FLAG = env.bool("NEXT_PUBLIC_MOCK_FLAG")
DUMMY_COMPANY_FORM_CODE = env.int("DUMMY_COMPANY_FORM_CODE")
ENABLE_DEBUG_ENV = env.bool("ENABLE_DEBUG_ENV")

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Authentication settings begin
SESSION_COOKIE_AGE = env.int("SESSION_COOKIE_AGE")
SESSION_COOKIE_SECURE = True

TERMS_OF_SERVICE_SESSION_KEY = env.str("TERMS_OF_SERVICE_SESSION_KEY")

AUTHENTICATION_BACKENDS = (
    "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
    "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
    "django.contrib.auth.backends.ModelBackend",
)

DISABLE_TOS_APPROVAL_CHECK = env.bool("DISABLE_TOS_APPROVAL_CHECK")

OIDC_API_TOKEN_AUTH = {
    "AUDIENCE": env.str("TOKEN_AUTH_ACCEPTED_AUDIENCE"),
    "API_SCOPE_PREFIX": env.str("TOKEN_AUTH_ACCEPTED_SCOPE_PREFIX"),
    "ISSUER": env.str("TOKEN_AUTH_AUTHSERVER_URL"),
    "API_AUTHORIZATION_FIELD": env.str("TOKEN_AUTH_FIELD_FOR_CONSENTS"),
    "REQUIRE_API_SCOPE_FOR_AUTHENTICATION": env.bool("TOKEN_AUTH_REQUIRE_SCOPE_PREFIX"),
    "USER_RESOLVER": "users.api.v1.authentications.resolve_user",
}

TUNNISTAMO_API_TOKENS_ENDPOINT = env.str("TUNNISTAMO_API_TOKENS_ENDPOINT")
HELSINKI_PROFILE_SCOPE = env.str("HELSINKI_PROFILE_SCOPE")
HELSINKI_PROFILE_API_URL = env.str("HELSINKI_PROFILE_API_URL")

OIDC_RP_SCOPES = f"openid profile {HELSINKI_PROFILE_SCOPE}"
OIDC_AUTH = {"OIDC_LEEWAY": env.int("OIDC_LEEWAY")}

OIDC_RP_SIGN_ALGO = "RS256"

OIDC_RP_CLIENT_ID = env.str("OIDC_RP_CLIENT_ID")
OIDC_RP_CLIENT_SECRET = env.str("OIDC_RP_CLIENT_SECRET")

OIDC_OP_BASE_URL = env.str("OIDC_OP_BASE_URL")
OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO = env.bool(
    "OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO"
)
OIDC_OP_AUTHORIZATION_ENDPOINT = f"{OIDC_OP_BASE_URL}/authorize"
OIDC_OP_TOKEN_ENDPOINT = f"{OIDC_OP_BASE_URL}/token"
OIDC_OP_USER_ENDPOINT = f"{OIDC_OP_BASE_URL}/userinfo"
OIDC_OP_JWKS_ENDPOINT = f"{OIDC_OP_BASE_URL}/jwks"
OIDC_OP_LOGOUT_ENDPOINT = f"{OIDC_OP_BASE_URL}/end-session"
OIDC_OP_LOGOUT_CALLBACK_URL = env.str("OIDC_OP_LOGOUT_CALLBACK_URL")

# Language selection is done with accept-language header in this project
# UPDATE: 2023-08-07
# Didn't seem to be working correctly with EAUTH forwards and landing back to callback url
# Changing this to False as nextjs's language autodetect seems to be at set to false too
OIDC_DISABLE_LANGUAGE_COOKIE = False

LOGIN_REDIRECT_URL = env.str("LOGIN_REDIRECT_URL")
LOGIN_REDIRECT_URL_FAILURE = env.str("LOGIN_REDIRECT_URL_FAILURE")
LOGOUT_REDIRECT_URL = env.str("LOGOUT_REDIRECT_URL")

EAUTHORIZATIONS_BASE_URL = env.str("EAUTHORIZATIONS_BASE_URL")
EAUTHORIZATIONS_CLIENT_ID = env.str("EAUTHORIZATIONS_CLIENT_ID")
EAUTHORIZATIONS_CLIENT_SECRET = env.str("EAUTHORIZATIONS_CLIENT_SECRET")
EAUTHORIZATIONS_API_OAUTH_SECRET = env.str("EAUTHORIZATIONS_API_OAUTH_SECRET")

# Azure ADFS
LOGIN_URL = "django_auth_adfs:login"

ADFS_CLIENT_ID = env.str("ADFS_CLIENT_ID") or "client_id"
ADFS_CLIENT_SECRET = env.str("ADFS_CLIENT_SECRET") or "client_secret"
ADFS_TENANT_ID = env.str("ADFS_TENANT_ID") or "tenant_id"

# https://django-auth-adfs.readthedocs.io/en/latest/azure_ad_config_guide.html#step-2-configuring-settings-py
AUTH_ADFS = {
    "AUDIENCE": ADFS_CLIENT_ID,
    "CLIENT_ID": ADFS_CLIENT_ID,
    "CLIENT_SECRET": ADFS_CLIENT_SECRET,
    "CLAIM_MAPPING": {"email": "mail"},
    "USERNAME_CLAIM": "oid",
    "TENANT_ID": ADFS_TENANT_ID,
    "RELYING_PARTY_ID": ADFS_CLIENT_ID,
}

ADFS_LOGIN_REDIRECT_URL = env.str("ADFS_LOGIN_REDIRECT_URL")
ADFS_LOGIN_REDIRECT_URL_FAILURE = env.str("ADFS_LOGIN_REDIRECT_URL_FAILURE")
ADFS_CONTROLLER_GROUP_UUIDS = env.list("ADFS_CONTROLLER_GROUP_UUIDS")
# Authentication settings end

FIELD_ENCRYPTION_KEYS = [ENCRYPTION_KEY]

# Django storages
DEFAULT_FILE_STORAGE = env("DEFAULT_FILE_STORAGE")

AZURE_ACCOUNT_NAME = env("AZURE_ACCOUNT_NAME")
AZURE_ACCOUNT_KEY = env("AZURE_ACCOUNT_KEY")
AZURE_CONTAINER = env("AZURE_CONTAINER")
AZURE_URL_EXPIRATION_SECS = env(
    "AZURE_URL_EXPIRATION_SECS"
)  # a typical setting would be 900

MAX_UPLOAD_SIZE = 10485760  # 10MB
MINIMUM_WORKING_HOURS_PER_WEEK = env("MINIMUM_WORKING_HOURS_PER_WEEK")

WKHTMLTOPDF_BIN = env("WKHTMLTOPDF_BIN")

TALPA_ROBOT_AUTH_CREDENTIAL = env("TALPA_ROBOT_AUTH_CREDENTIAL")

YRTTI_TIMEOUT = env("YRTTI_TIMEOUT")
YRTTI_BASE_URL = env("YRTTI_BASE_URL")
YRTTI_AUTH_USERNAME = env("YRTTI_AUTH_USERNAME")
YRTTI_AUTH_PASSWORD = env("YRTTI_AUTH_PASSWORD")
YRTTI_SEARCH_LIMIT = env("YRTTI_SEARCH_LIMIT")
YRTTI_DISABLE = env("YRTTI_DISABLE")

SERVICE_BUS_TIMEOUT = env("SERVICE_BUS_TIMEOUT")
SERVICE_BUS_BASE_URL = env("SERVICE_BUS_BASE_URL")
SERVICE_BUS_AUTH_USERNAME = env("SERVICE_BUS_AUTH_USERNAME")
SERVICE_BUS_AUTH_PASSWORD = env("SERVICE_BUS_AUTH_PASSWORD")
SERVICE_BUS_SEARCH_LIMIT = env("SERVICE_BUS_SEARCH_LIMIT")

HANDLERS_GROUP_NAME = "Application handlers"

GDPR_API_QUERY_SCOPE = env("GDPR_API_QUERY_SCOPE")
GDPR_API_DELETE_SCOPE = env("GDPR_API_DELETE_SCOPE")
GDPR_API_MODEL = "users.User"

# local_settings.py can be used to override environment-specific settings
# like database and email that differ between development and production.
local_settings_path = os.path.join(checkout_dir(), "local_settings.py")
if os.path.exists(local_settings_path):
    with open(local_settings_path) as fp:
        code = compile(fp.read(), local_settings_path, "exec")
    exec(code, globals(), locals())

CORS_ALLOW_HEADERS = (
    *default_headers,
    "baggage",
    "sentry-trace",
)

AHJO_CLIENT_ID = env("AHJO_CLIENT_ID")
AHJO_CLIENT_SECRET = env("AHJO_CLIENT_SECRET")
AHJO_TOKEN_URL = env("AHJO_TOKEN_URL")
AHJO_REST_API_URL = env("AHJO_REST_API_URL")
AHJO_REDIRECT_URL = env("AHJO_REDIRECT_URL")

REST_SAFE_LIST_IPS = (env("AHJO_ALLOWED_IP"),)
