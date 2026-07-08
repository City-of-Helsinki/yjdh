import base64
import os
import tempfile
from datetime import datetime
from functools import partial
from urllib.parse import urlparse

import environ
import saml2
import saml2.saml
import sentry_sdk
from csp.constants import SELF, UNSAFE_INLINE
from django.core.exceptions import ImproperlyConfigured
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from saml2.sigver import get_xmlsec_binary
from sentry_sdk.integrations.django import DjangoIntegration

from applications.target_groups import (
    NinthGraderTargetGroup,
    UpperSecondaryFirstYearTargetGroup,
)
from common.backward_compatibility import convert_to_django_4_2_csrf_trusted_origins
from kesaseteli.sentry_config import sentry_traces_sampler
from shared.suomi_fi.utils import get_contact_person_configuration

checkout_dir = environ.Path(__file__) - 2
assert os.path.exists(checkout_dir("manage.py"))

parent_dir = checkout_dir.path("..")
if os.path.isdir(parent_dir("etc")):
    env_file = parent_dir("etc/env")
    default_var_root = environ.Path(parent_dir("var"))
else:
    env_file = checkout_dir(".env.kesaseteli-backend")
    default_var_root = environ.Path(checkout_dir("var"))

env = environ.Env(
    DEBUG=(bool, False),
    SECRET_KEY=(str, ""),
    MEDIA_ROOT=(environ.Path(), default_var_root("media")),
    STATIC_ROOT=(environ.Path(), default_var_root("static")),
    MEDIA_URL=(str, "/media/"),
    STATIC_URL=(str, "/static/"),
    YOUTH_URL=(str, "https://localhost:3100"),
    HANDLER_URL=(str, "https://localhost:3200"),
    NEXT_PUBLIC_BACKEND_URL=(str, "https://localhost:8000"),
    ALLOWED_HOSTS=(list, ["*"]),
    USE_X_FORWARDED_HOST=(bool, False),
    DATABASE_PASSWORD=(str, ""),
    DATABASE_URL=(
        str,
        "postgres:///kesaseteli",
    ),
    CACHE_URL=(str, "locmemcache://"),
    MAIL_MAILGUN_KEY=(str, ""),
    MAIL_MAILGUN_DOMAIN=(str, ""),
    MAIL_MAILGUN_API=(str, ""),
    SENTRY_DSN=(str, ""),
    SENTRY_ENVIRONMENT=(str, ""),
    SENTRY_RELEASE=(str, None),
    SENTRY_ATTACH_STACKTRACE=(bool, False),
    SENTRY_MAX_BREADCRUMBS=(int, 0),
    SENTRY_REQUEST_BODIES=(str, "never"),
    SENTRY_SEND_DEFAULT_PII=(bool, False),
    SENTRY_WITH_LOCALS=(bool, False),
    SENTRY_TRACES_SAMPLE_RATE=(float, 0),
    SENTRY_TRACES_IGNORE_PATHS=(list, ["/healthz", "/readiness"]),
    CORS_ALLOWED_ORIGINS=(list, []),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    CSRF_COOKIE_DOMAIN=(str, "localhost"),
    CSRF_TRUSTED_ORIGINS=(list, []),
    CSRF_COOKIE_NAME=(str, "yjdhcsrftoken"),
    YTJ_BASE_URL=(str, "https://avoindata.prh.fi/opendata-ytj-api/v3"),
    YTJ_TIMEOUT=(int, 30),
    UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT=(bool, False),
    NEXT_PUBLIC_MOCK_FLAG=(bool, False),
    SESSION_COOKIE_AGE=(int, 60 * 60 * 2),
    OIDC_RP_CLIENT_ID=(str, ""),
    OIDC_RP_CLIENT_SECRET=(str, ""),
    OIDC_OP_BASE_URL=(str, ""),
    OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO=(bool, True),
    OIDC_VERIFY_SSL=(bool, True),
    LOGIN_REDIRECT_URL=(str, "/"),
    LOGIN_REDIRECT_URL_FAILURE=(str, "/"),
    LOGOUT_REDIRECT_URL=(str, "/"),
    OIDC_OP_LOGOUT_CALLBACK_URL=(str, "/"),
    ADFS_LOGIN_REDIRECT_URL=(str, "/excel-download/"),
    ADFS_LOGIN_REDIRECT_URL_FAILURE=(str, "/"),
    EAUTHORIZATIONS_BASE_URL=(str, ""),
    EAUTHORIZATIONS_CLIENT_ID=(str, ""),
    EAUTHORIZATIONS_CLIENT_SECRET=(str, ""),
    EAUTHORIZATIONS_API_OAUTH_SECRET=(str, ""),
    ADFS_CLIENT_ID=(str, "client_id"),
    ADFS_CLIENT_SECRET=(str, "client_secret"),
    ADFS_TENANT_ID=(str, "tenant_id"),
    ADFS_CONTROLLER_GROUP_UUIDS=(list, []),
    DEFAULT_FILE_STORAGE=(str, "django.core.files.storage.FileSystemStorage"),
    AZURE_ACCOUNT_NAME=(str, ""),
    AZURE_BLOB_STORAGE_SAS_TOKEN=(str, ""),
    AZURE_CONTAINER=(str, ""),
    ELASTICSEARCH_APP_AUDIT_LOG_INDEX=(str, "kesaseteli_audit_log"),
    # Should auth events be logged to resilient logger
    ENABLE_AUTH_LOGGING=(bool, False),
    # Should resilient logger submit unsent entries
    RESILIENT_LOGGER_SUBMIT_UNSENT_ENTRIES=(bool, False),
    AUDIT_LOG_ENV=(str, "development"),
    AUDIT_LOG_ORIGIN=(str, ""),
    AUDIT_LOG_ES_URL=(str, ""),
    AUDIT_LOG_ES_USERNAME=(str, ""),
    AUDIT_LOG_ES_PASSWORD=(str, ""),
    AUDIT_LOG_ES_INDEX_AUTH=(str, ""),
    AUDIT_LOG_ES_INDEX=(str, ""),
    # Random 32 bytes AES key, for testing purpose only, DO NOT use it value in
    # staging/production
    # Always override this value from env variables
    ENCRYPTION_KEY=(str, ""),
    SOCIAL_SECURITY_NUMBER_HASH_KEY=(
        str,
        "",
    ),
    ENABLE_ADMIN=(bool, False),
    # Configuration for the staff admin group name (ADFS group). Default is None.
    AD_ADMIN_GROUP_NAME=(str, None),
    PASSWORD_LOGIN_DISABLED=(bool, False),
    DB_PREFIX=(str, ""),
    EMAIL_USE_TLS=(bool, False),
    EMAIL_HOST=(str, "relay.hel.fi"),
    EMAIL_HOST_USER=(str, ""),
    EMAIL_HOST_PASSWORD=(str, ""),
    EMAIL_PORT=(int, 25),
    EMAIL_TIMEOUT=(int, 15),
    DEFAULT_FROM_EMAIL=(str, "Kesäseteli <kesaseteli@hel.fi>"),
    HANDLER_EMAIL=(str, "Kesäseteli <kesaseteli@hel.fi>"),
    NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS=(
        int,
        12 * 60 * 60,
    ),
    NEXT_PUBLIC_DISABLE_VTJ=(bool, False),
    VTJ_PERSONAL_ID_QUERY_URL=(
        str,
        "https://vtj-integration-test.agw.arodevtest.hel.fi/api/HenkilonTunnuskysely",
    ),
    VTJ_USERNAME=(str, ""),
    VTJ_PASSWORD=(str, ""),
    VTJ_TIMEOUT=(int, 30),
    NEXT_PUBLIC_ENABLE_SUOMIFI=(bool, False),
    SUOMIFI_TEST=(bool, False),
    # base64 encoded public key certificate (e.g. base64 -w 0 public.pem)
    SUOMIFI_KEY=(str, None),
    # base64 encoded private key (e.g. base64 -w 0 private.key)
    SUOMIFI_CERT=(str, None),
    SUOMIFI_SERVICE_NAME_EXTRA=(str, ""),
    SUOMIFI_TECHNICAL_FIRST_NAME=(str, None),
    SUOMIFI_TECHNICAL_LAST_NAME=(str, None),
    SUOMIFI_TECHNICAL_EMAIL=(str, None),
    SUOMIFI_SUPPORT_FIRST_NAME=(str, None),
    SUOMIFI_SUPPORT_LAST_NAME=(str, None),
    SUOMIFI_SUPPORT_EMAIL=(str, None),
    SUOMIFI_ADMINISTRATIVE_FIRST_NAME=(str, None),
    SUOMIFI_ADMINISTRATIVE_LAST_NAME=(str, None),
    SUOMIFI_ADMINISTRATIVE_EMAIL=(str, None),
    EXCEL_DOWNLOAD_BATCH_SIZE=(int, 50),
    EXCLUDE_2026_EXCEL_FIELDS=(bool, True),
    APP_RELEASE=(str, ""),
    OPENSHIFT_BUILD_COMMIT=(str, ""),
    SAML_ALLOWED_HOSTS=(list, None),
    DJANGO_LOG_LEVEL=(str, "INFO"),
    DJANGOSAML2_LOG_LEVEL=(str, "INFO"),
    SHARED_LOG_LEVEL=(str, "INFO"),
    KESASETELI_LOG_LEVEL=(str, "INFO"),
)
if os.path.exists(env_file):
    env.read_env(env_file)

BASE_DIR = str(checkout_dir)

DEBUG = env.bool("DEBUG")
SECRET_KEY = env.str("SECRET_KEY")
if DEBUG and not SECRET_KEY:
    SECRET_KEY = "xxx"
ENCRYPTION_KEY = env.str("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    raise ImproperlyConfigured("ENCRYPTION_KEY must be set.")
SOCIAL_SECURITY_NUMBER_HASH_KEY = env.str("SOCIAL_SECURITY_NUMBER_HASH_KEY")
ENABLE_ADMIN = env.bool("ENABLE_ADMIN")
AD_ADMIN_GROUP_NAME = env.str("AD_ADMIN_GROUP_NAME")
PASSWORD_LOGIN_DISABLED = env.bool("PASSWORD_LOGIN_DISABLED")
NEXT_PUBLIC_DISABLE_VTJ = env.bool("NEXT_PUBLIC_DISABLE_VTJ")
VTJ_PERSONAL_ID_QUERY_URL = env.str("VTJ_PERSONAL_ID_QUERY_URL")
VTJ_USERNAME = env.str("VTJ_USERNAME")
VTJ_PASSWORD = env.str("VTJ_PASSWORD")
VTJ_TIMEOUT = env.int("VTJ_TIMEOUT")
NEXT_PUBLIC_ENABLE_SUOMIFI = env("NEXT_PUBLIC_ENABLE_SUOMIFI")

if NEXT_PUBLIC_ENABLE_SUOMIFI and not SOCIAL_SECURITY_NUMBER_HASH_KEY:
    raise ImproperlyConfigured(
        "SOCIAL_SECURITY_NUMBER_HASH_KEY must be set when Suomi.fi is enabled."
    )
EXCEL_DOWNLOAD_BATCH_SIZE = env.int("EXCEL_DOWNLOAD_BATCH_SIZE")
EXCLUDE_2026_EXCEL_FIELDS = env.bool("EXCLUDE_2026_EXCEL_FIELDS")

DB_PREFIX = {
    None: env.str("DB_PREFIX"),
}

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
USE_X_FORWARDED_HOST = env.bool("USE_X_FORWARDED_HOST")

DATABASES = {"default": env.db()}

if env("DATABASE_PASSWORD"):
    DATABASES["default"]["PASSWORD"] = env("DATABASE_PASSWORD")

CACHES = {"default": env.cache()}

# Release metadata for readiness probe
COMMIT_HASH = env("OPENSHIFT_BUILD_COMMIT")
APP_RELEASE = env("APP_RELEASE")
APP_BUILD_TIME = datetime.fromtimestamp(os.path.getmtime(__file__))

SENTRY_ATTACH_STACKTRACE = env.bool("SENTRY_ATTACH_STACKTRACE")
SENTRY_MAX_BREADCRUMBS = env.int("SENTRY_MAX_BREADCRUMBS")
SENTRY_REQUEST_BODIES = env.str("SENTRY_REQUEST_BODIES")
SENTRY_SEND_DEFAULT_PII = env.bool("SENTRY_SEND_DEFAULT_PII")
SENTRY_WITH_LOCALS = env.bool("SENTRY_WITH_LOCALS")
SENTRY_TRACES_SAMPLE_RATE = env("SENTRY_TRACES_SAMPLE_RATE")
SENTRY_TRACES_IGNORE_PATHS = env.list("SENTRY_TRACES_IGNORE_PATHS")


sentry_sdk.init(
    attach_stacktrace=SENTRY_ATTACH_STACKTRACE,
    max_breadcrumbs=SENTRY_MAX_BREADCRUMBS,
    max_request_body_size=SENTRY_REQUEST_BODIES,
    send_default_pii=SENTRY_SEND_DEFAULT_PII,
    include_local_variables=SENTRY_WITH_LOCALS,
    dsn=env.str("SENTRY_DSN"),
    release=env("SENTRY_RELEASE"),
    environment=env("SENTRY_ENVIRONMENT"),
    integrations=[DjangoIntegration()],
    traces_sampler=partial(
        sentry_traces_sampler,
        ignore_paths=SENTRY_TRACES_IGNORE_PATHS,
        sample_rate=SENTRY_TRACES_SAMPLE_RATE or 0,
    ),
)

MEDIA_ROOT = env("MEDIA_ROOT")
STATIC_ROOT = env("STATIC_ROOT")
MEDIA_URL = env.str("MEDIA_URL")
STATIC_URL = env.str("STATIC_URL")
YOUTH_URL = env.str("YOUTH_URL")
HANDLER_URL = env.str("HANDLER_URL")
EMPLOYER_URL = env.str("EMPLOYER_URL", default=None)
NEXT_PUBLIC_BACKEND_URL = env("NEXT_PUBLIC_BACKEND_URL")

ROOT_URLCONF = "kesaseteli.urls"
WSGI_APPLICATION = "kesaseteli.wsgi.application"

LANGUAGE_CODE = "fi"
LANGUAGES = (("fi", _("Finnish")), ("en", _("English")), ("sv", _("Swedish")))
TIME_ZONE = "Europe/Helsinki"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

INSTALLED_APPS = [
    "django.contrib.auth",
    "kesaseteli.admin_site.KesaseteliAdminConfig",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "csp",
    "rest_framework",
    "mozilla_django_oidc",
    "django_extensions",
    "django_auth_adfs",
    "auditlog",
    "auditlog_extra",
    "drf_spectacular",
    # shared apps
    "shared.oidc",
    # local apps
    "applications",
    "companies",
    "staff_admin_permissions.apps.StaffAdminPermissionsConfig",
    "django.contrib.postgres",
    "resilient_logger",
    "kesaseteli",  # MUST BE LAST for AUDIT LOGGING enforcement! See app's apps.py
]

if NEXT_PUBLIC_ENABLE_SUOMIFI:
    INSTALLED_APPS.append("djangosaml2")


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "csp.middleware.CSPMiddleware",
    "common.middleware.PermissionsPolicyMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "auditlog_extra.middleware.AuditlogMiddleware",
]

if NEXT_PUBLIC_ENABLE_SUOMIFI:
    MIDDLEWARE.append("djangosaml2.middleware.SamlSessionMiddleware")

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [parent_dir("shared/templates")],
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
HANDLER_EMAIL = env.str("HANDLER_EMAIL")
NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = env.int(
    "NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS"
)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS")

CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": [SELF],
        "style-src": [SELF, UNSAFE_INLINE],
        "img-src": [SELF, "data:"],
        "base-uri": [SELF],
        "object-src": ["'none'"],
    }
}

CSRF_COOKIE_DOMAIN = env.str("CSRF_COOKIE_DOMAIN")
CSRF_TRUSTED_ORIGINS = convert_to_django_4_2_csrf_trusted_origins(
    env.list("CSRF_TRUSTED_ORIGINS")
)
CSRF_COOKIE_NAME = env.str("CSRF_COOKIE_NAME")
CSRF_COOKIE_SECURE = True

OIDC_REDIRECT_ALLOWED_HOSTS = env.list(
    "OIDC_REDIRECT_ALLOWED_HOSTS",
    default=[
        urlparse(HANDLER_URL).netloc,
    ],
)
OIDC_REDIRECT_REQUIRE_HTTPS = env.bool("OIDC_REDIRECT_REQUIRE_HTTPS", default=True)

# Should auth events be logged to resilient logger
ENABLE_AUTH_LOGGING = env("ENABLE_AUTH_LOGGING")
AUDIT_LOG_ORIGIN = env("AUDIT_LOG_ORIGIN")

# Resilient logger — ships compliance events and django-auditlog entries to ES
RESILIENT_LOGGER = {
    "origin": AUDIT_LOG_ORIGIN,
    "environment": env("AUDIT_LOG_ENV"),
    # Should resilient logger transfer entries to ES (with cronjob action)
    "submit_unsent_entries": env("RESILIENT_LOGGER_SUBMIT_UNSENT_ENTRIES"),
    # Should resilient logger delete entries after transfer to ES (with cronjob action)
    "clear_sent_entries": True,
    "sources": [
        # DVV auth logs
        {"class": "resilient_logger.sources.ResilientLogSource"},
        # django-auditlog logs
        {"class": "resilient_logger.sources.DjangoAuditLogSource"},
    ],
    "targets": [
        {
            # Use the custom Elasticsearch log target that routes entries to different
            # indices
            "class": "kesaseteli.log_targets.RoutedElasticsearchLogTarget",
            "es_url": env("AUDIT_LOG_ES_URL"),
            "es_username": env("AUDIT_LOG_ES_USERNAME"),
            "es_password": env("AUDIT_LOG_ES_PASSWORD"),
            # DVV auth logs → resilient_index
            "resilient_index": env("AUDIT_LOG_ES_INDEX_AUTH")
            or env("AUDIT_LOG_ES_INDEX")
            or env("ELASTICSEARCH_APP_AUDIT_LOG_INDEX"),
            # django-auditlog logs → auditlog_index
            "auditlog_index": env("AUDIT_LOG_ES_INDEX")
            or env("ELASTICSEARCH_APP_AUDIT_LOG_INDEX"),
            "required": True,
        }
    ],
    "batch_limit": 5000,
    "chunk_size": 500,
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(asctime)s p%(process)d %(name)s %(levelname)s: %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": env.str("DJANGO_LOG_LEVEL")},
        "djangosaml2": {
            "handlers": ["console"],
            "level": env.str("DJANGOSAML2_LOG_LEVEL"),
        },
        "shared": {"handlers": ["console"], "level": env.str("SHARED_LOG_LEVEL")},
        "kesaseteli": {
            "handlers": ["console"],
            "level": env.str("KESASETELI_LOG_LEVEL"),
        },
    },
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication"
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# Keep the generated schema aligned with the Kesäseteli API surface and the
# environments we actively deploy to.
SPECTACULAR_SETTINGS = {
    "TITLE": "Kesäseteli API",
    # Explicit enum names keep the generated components stable across schema
    # regenerations and avoid drf-spectacular fallback names for repeated status
    # fields.
    "ENUM_NAME_OVERRIDES": {
        "EmployerApplicationStatusEnum": "applications.enums.EmployerApplicationStatus",
        "YouthApplicationStatusEnum": "applications.enums.YouthApplicationStatus",
        # Model and OpenAPI serializers share this language enum.
        # Stops drf-spectacular from emitting hash-suffixed names like LanguageC70Enum.
        "ApplicationLanguageEnum": "applications.enums.APPLICATION_LANGUAGE_CHOICES",
    },
    "PREPROCESSING_HOOKS": [
        "common.openapi.preprocessing_filter_public_api_paths",
    ],
    "POSTPROCESSING_HOOKS": [
        "common.openapi.replace_underscores_with_spaces",
        "drf_spectacular.hooks.postprocess_schema_enums",
    ],
    "DESCRIPTION": "REST API for Kesäseteli application management",
    "VERSION": APP_RELEASE or "0.0.1",
    "OAS_VERSION": "3.1.0",
    # Strip the version prefix when deriving ReDoc/Swagger tags so resources
    # group as company, employerapplications, etc. instead of v1.
    "SCHEMA_PATH_PREFIX": "/v1/",
}

YTJ_BASE_URL = env.str("YTJ_BASE_URL")
YTJ_TIMEOUT = env.int("YTJ_TIMEOUT")

# When an employer application is submitted, trigger a background update
# of the company details (name, company form, address etc.) from YTJ.
UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT = env.bool("UPDATE_COMPANY_FROM_YTJ_ON_SUBMIT")

# Mock flag for testing purposes
NEXT_PUBLIC_MOCK_FLAG = env.bool("NEXT_PUBLIC_MOCK_FLAG")

if NEXT_PUBLIC_MOCK_FLAG:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# Authentication
SESSION_COOKIE_AGE = env.int("SESSION_COOKIE_AGE")
SESSION_COOKIE_SECURE = True
# SAML SLO requires allowing sessiond to be passed
SESSION_COOKIE_SAMESITE = "None"

AUTHENTICATION_BACKENDS = [
    "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# If Suomi.fi not enabled we will enable the legacy Kesäseteli auth.
AUTHENTICATION_BACKENDS.insert(
    0,
    (
        "shared.suomi_fi.auth.SuomiFiSAML2AuthenticationBackend"
        if NEXT_PUBLIC_ENABLE_SUOMIFI
        else "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend"
    ),
)

OIDC_RP_SIGN_ALGO = "RS256"
OIDC_RP_SCOPES = "openid profile"

OIDC_RP_CLIENT_ID = env.str("OIDC_RP_CLIENT_ID")
OIDC_RP_CLIENT_SECRET = env.str("OIDC_RP_CLIENT_SECRET")

OIDC_OP_BASE_URL = env.str("OIDC_OP_BASE_URL")
OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO = env.bool(
    "OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO"
)
OIDC_OP_AUTHORIZATION_ENDPOINT = f"{OIDC_OP_BASE_URL}/auth"
OIDC_OP_TOKEN_ENDPOINT = f"{OIDC_OP_BASE_URL}/token"
OIDC_OP_USER_ENDPOINT = f"{OIDC_OP_BASE_URL}/userinfo"
OIDC_OP_JWKS_ENDPOINT = f"{OIDC_OP_BASE_URL}/certs"
OIDC_OP_LOGOUT_ENDPOINT = f"{OIDC_OP_BASE_URL}/logout"
OIDC_OP_LOGOUT_CALLBACK_URL = env.str("OIDC_OP_LOGOUT_CALLBACK_URL")

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
    "CLAIM_MAPPING": {"email": "upn"},
    "USERNAME_CLAIM": "oid",
    "TENANT_ID": ADFS_TENANT_ID,
    "RELYING_PARTY_ID": ADFS_CLIENT_ID,
    # "VERSION": "v2.0",
    # "SCOPES": ["openid", "profile", "email"],
    # "CONFIG_RELOAD_INTERVAL": 0,
}

ADFS_LOGIN_REDIRECT_URL = env.str("ADFS_LOGIN_REDIRECT_URL")
ADFS_LOGIN_REDIRECT_URL_FAILURE = env.str("ADFS_LOGIN_REDIRECT_URL_FAILURE")

ADFS_CONTROLLER_GROUP_UUIDS = env.list("ADFS_CONTROLLER_GROUP_UUIDS")


# Suomi.fi (djangosaml2)

SAML_ATTRIBUTE_MAPPING = {
    "nationalIdentificationNumber": ("username",),
    "givenName": ("first_name",),
    "sn": ("last_name",),
}
SAML_SESSION_COOKIE_NAME = "kesaseteli_saml_session"
SAML_CREATE_UNKNOWN_USER = True
SAML_DJANGO_USER_MAIN_ATTRIBUTE = "username"
SAML_USE_NAME_ID_AS_USERNAME = False  # Use SAML_ATTRIBUTE_MAPPING for username
SAML_IGNORE_LOGOUT_ERRORS = True
SAML_ALLOWED_HOSTS = env.list(
    "SAML_ALLOWED_HOSTS",
    default=[
        urlparse(EMPLOYER_URL).netloc,
    ]
    if EMPLOYER_URL
    else [],
)
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

ACS_DEFAULT_REDIRECT_URL = reverse_lazy("eauth_authentication_init")
SUOMIFI_TEST = env("SUOMIFI_TEST")
if NEXT_PUBLIC_MOCK_FLAG:
    SUOMIFI_SERVICE_NAME_EXTRA = "MOCK"
else:
    SUOMIFI_SERVICE_NAME_EXTRA = env("SUOMIFI_SERVICE_NAME_EXTRA")

# See backend/shared/README.md for info about the Suomi.fi IDP metadata files
SUOMIFI_IDP_METADATA_FILENAME = (
    "idp-metadata-secondary.xml"
    if SUOMIFI_TEST
    else "idp-metadata-tunnistautuminen.xml"
)
SUOMIFI_IDP_METADATA_PATH = parent_dir(
    f"shared/shared/suomi_fi/metadata/{SUOMIFI_IDP_METADATA_FILENAME}"
)
SUOMIFI_CERT = env("SUOMIFI_CERT")
SUOMIFI_KEY = env("SUOMIFI_KEY")
SUOMIFI_SERVICE_NAME_FI = " ".join(
    filter(None, ["Nuorten kesäseteli", env("SUOMIFI_SERVICE_NAME_EXTRA")])
)
SUOMIFI_SERVICE_NAME_SV = " ".join(
    filter(None, ["Sommarsedel för unga", env("SUOMIFI_SERVICE_NAME_EXTRA")])
)
SUOMIFI_SERVICE_NAME_EN = " ".join(
    filter(None, ["Summer Job Voucher for youth", env("SUOMIFI_SERVICE_NAME_EXTRA")])
)

SAML_CONFIG = {
    "xmlsec_binary": get_xmlsec_binary(),
    "entity_attributes": [
        {
            "format": "urn:oasis:names:tc:SAML:2.0:attrname-format:uri",
            "name": "FinnishAuthMethod",
            "values": [
                "http://ftn.ficora.fi/2017/loa3",  # korkea, fLoA3
                "http://eidas.europa.eu/LoA/high",  # korkea, eLoA3
                "http://ftn.ficora.fi/2017/loa2",  # korotettu, fLoA2
                "http://eidas.europa.eu/LoA/substantial",  # korotettu, eLoA2
            ],
        },
        {
            "friendly_name": "EidasSupport",
            "name": "urn:oid:1.2.246.517.3003.111.14",
            "format": "urn:oasis:names:tc:SAML:2.0:attrname-format:uri",
            "values": ["full"],  # full or none
        },
        {
            "friendly_name": "VtjVerificationRequired",
            "name": "urn:oid:1.2.246.517.3003.111.3",
            "format": "urn:oasis:names:tc:SAML:2.0:attrname-format:uri",
            "values": ["true"],
        },
        {
            "friendly_name": "SkipEndpointValidationWhenSigned",
            "name": "urn:oid:1.2.246.517.3003.111.4",
            "format": "urn:oasis:names:tc:SAML:2.0:attrname-format:uri",
            "values": ["true"],
        },
    ],
    "entityid": f"{NEXT_PUBLIC_BACKEND_URL}/saml2/metadata/",
    "attribute_map_dir": parent_dir("shared/shared/suomi_fi/attributemaps"),
    "allow_unknown_attributes": True,
    # ServiceName
    # pysaml2 only supports a single value here. FI and SV injected in the metadata.
    "name": SUOMIFI_SERVICE_NAME_EN,
    "service": {
        "sp": {
            "name_id_format": saml2.saml.NAMEID_FORMAT_TRANSIENT,
            "endpoints": {
                "assertion_consumer_service": [
                    (f"{NEXT_PUBLIC_BACKEND_URL}/saml2/acs/", saml2.BINDING_HTTP_POST),
                ],
                "single_logout_service": [
                    (
                        f"{NEXT_PUBLIC_BACKEND_URL}/saml2/ls/",
                        saml2.BINDING_HTTP_REDIRECT,
                    ),
                ],
            },
            "name_id_format_allow_create": True,
            "required_attributes": [
                "nationalIdentificationNumber",
                "electronicIdentificationNumber",
                "sn",
                "givenName",
            ],
            "optional_attributes": [
                "FirstName",
                "FamilyName",
                "PersonIdentifier",
                "DateOfBirth",
                "displayName",
                "cn",
            ],
            "requested_authn_context": {
                "authn_context_class_ref": [
                    "http://ftn.ficora.fi/2017/loa3",  # korkea, fLoA3
                    # "http://eidas.europa.eu/LoA/high",  # korkea, eLoA3
                    "http://ftn.ficora.fi/2017/loa2",  # korotettu, fLoA2
                    # "http://eidas.europa.eu/LoA/substantial",  # korotettu, eLoA2
                ],
                "comparison": "exact",
            },
            "authn_requests_signed": True,
            "logout_requests_signed": True,
            "logout_responses_signed": True,
            "signing_algorithm": saml2.xmldsig.SIG_RSA_SHA256,
            "digest_algorithm": saml2.xmldsig.DIGEST_SHA256,
            "allow_unsolicited": False,
            "ui_info": {
                "display_name": [
                    {"text": "Nuorten kesäseteli", "lang": "fi"},
                    {"text": "Sommarsedel för unga", "lang": "sv"},
                    {"text": "Summer Job Voucher for youth", "lang": "en"},
                ],
                "description": [
                    {"text": "Nuorten kesäseteli", "lang": "fi"},
                    {"text": "Sommarsedel för unga", "lang": "sv"},
                    {"text": "Summer Job Voucher for youth", "lang": "en"},
                ],
                "information_url": [
                    {
                        "text": "https://nuorten.hel.fi/opiskelu-ja-tyo/kesaseteli/",
                        "lang": "fi",
                    },
                    {
                        "text": (
                            "https://nuorten.hel.fi/sv/studier-och-jobb/sommarsedeln/"
                        ),
                        "lang": "sv",
                    },
                    {
                        "text": (
                            "https://nuorten.hel.fi/en/studies-and-work/the-summer-job-voucher/"
                        ),
                        "lang": "en",
                    },
                ],
            },
        },
    },
    "metadata": {
        "local": [SUOMIFI_IDP_METADATA_PATH],
    },
    "debug": DEBUG,
    "contact_person": list(
        filter(
            None,
            [
                # Mandatory
                get_contact_person_configuration(
                    first_name=env("SUOMIFI_TECHNICAL_FIRST_NAME"),
                    last_name=env("SUOMIFI_TECHNICAL_LAST_NAME"),
                    email=env("SUOMIFI_TECHNICAL_EMAIL"),
                    company="Helsingin kaupunki",
                    contact_type="technical",
                ),
                get_contact_person_configuration(
                    first_name=env("SUOMIFI_SUPPORT_FIRST_NAME"),
                    last_name=env("SUOMIFI_SUPPORT_LAST_NAME"),
                    email=env("SUOMIFI_SUPPORT_EMAIL"),
                    company="Helsingin kaupunki",
                    contact_type="support",
                ),
                get_contact_person_configuration(
                    first_name=env("SUOMIFI_ADMINISTRATIVE_FIRST_NAME"),
                    last_name=env("SUOMIFI_ADMINISTRATIVE_LAST_NAME"),
                    email=env("SUOMIFI_ADMINISTRATIVE_EMAIL"),
                    company="Helsingin kaupunki",
                    contact_type="administrative",
                ),
            ],
        )
    ),
    "organization": {
        "name": [
            ("Helsingin kaupunki", "fi"),
            ("Helsingfors stad", "sv"),
            ("City of Helsinki", "en"),
        ],
        "display_name": [
            ("Helsingin kaupunki", "fi"),
            ("Helsingfors stad", "sv"),
            ("City of Helsinki", "en"),
        ],
        "url": [
            ("https://www.hel.fi/helsinki/fi", "fi"),
            ("https://www.hel.fi/helsinki/sv", "sv"),
            ("https://www.hel.fi/helsinki/en", "en"),
        ],
    },
}

if SUOMIFI_CERT and SUOMIFI_KEY:
    # Cert/key is base64 encoded into a one line string
    # This allows to put the key as a singleline string into an environment variable.
    # Example encode base64 -w 0 dev-public.pem > dev-public.pem.b64

    with tempfile.NamedTemporaryFile(delete=False) as f:
        f.write(base64.b64decode(SUOMIFI_CERT))
        suomifi_cert_filename = f.name
    with tempfile.NamedTemporaryFile(delete=False) as f:
        f.write(base64.b64decode(SUOMIFI_KEY))
        suomifi_key_filename = f.name

    SAML_CONFIG.update(
        {
            "key_file": suomifi_key_filename,
            "cert_file": suomifi_cert_filename,
            "encryption_keypairs": [
                {
                    "key_file": suomifi_key_filename,
                    "cert_file": suomifi_cert_filename,
                }
            ],
        }
    )

if SUOMIFI_TEST:
    # Test authentication method which is only available in the customer testing
    # environment
    SAML_CONFIG["entity_attributes"][0]["values"].append(
        "urn:oid:1.2.246.517.3002.110.999"
    )
    SAML_CONFIG["service"]["sp"]["requested_authn_context"][
        "authn_context_class_ref"
    ].append("urn:oid:1.2.246.517.3002.110.999")

# End of Authentication

FIELD_ENCRYPTION_KEYS = [ENCRYPTION_KEY]

# Django storages
DEFAULT_FILE_STORAGE = env("DEFAULT_FILE_STORAGE")

# Override SAS-token exposing AzureStorage always with custom storage that
# doesn't expose the SAS token in the URL for added security:
if DEFAULT_FILE_STORAGE == "storages.backends.azure_storage.AzureStorage":
    DEFAULT_FILE_STORAGE = "common.storage.AzureStorageWithoutQuerystringAuth"

STORAGES = {
    "default": {
        "BACKEND": DEFAULT_FILE_STORAGE,
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Make sure the SAS-token exposing AzureStorage really is not being used:
if STORAGES["default"]["BACKEND"] == "storages.backends.azure_storage.AzureStorage":
    raise ImproperlyConfigured(
        "SAS-token exposing vulnerable AzureStorage being used. "
        "Use common.storage.AzureStorageWithoutQuerystringAuth instead."
    )

AZURE_ACCOUNT_NAME = env("AZURE_ACCOUNT_NAME")
AZURE_SAS_TOKEN = env("AZURE_BLOB_STORAGE_SAS_TOKEN")
AZURE_CONTAINER = env("AZURE_CONTAINER")

MAX_UPLOAD_SIZE = 10485760  # 10MB

# local_settings.py can be used to override environment-specific settings
# like database and email that differ between development and production.
local_settings_path = os.path.join(checkout_dir(), "local_settings.py")
if os.path.exists(local_settings_path):
    with open(local_settings_path) as fp:
        code = compile(fp.read(), local_settings_path, "exec")
    exec(code, globals(), locals())


AUTO_ASSIGN_ADMIN_TO_STAFF = env.bool(
    "AUTO_ASSIGN_ADMIN_TO_STAFF", default=DEBUG and NEXT_PUBLIC_MOCK_FLAG
)


# Summer Voucher default / fallback configurations
SUMMER_VOUCHER_DEFAULT_TARGET_GROUPS = [
    NinthGraderTargetGroup.identifier,
    UpperSecondaryFirstYearTargetGroup.identifier,
]
SUMMER_VOUCHER_DEFAULT_VOUCHER_VALUE = 350
SUMMER_VOUCHER_DEFAULT_MIN_WORK_COMPENSATION = 500
SUMMER_VOUCHER_DEFAULT_MIN_WORK_HOURS = 60

# Load auditlog settings
from kesaseteli.auditlog_settings import *  # noqa: E402, F403
