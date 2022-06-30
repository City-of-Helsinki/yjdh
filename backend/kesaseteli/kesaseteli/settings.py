import base64
import os
import tempfile

import environ
import saml2
import saml2.saml
import sentry_sdk
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from saml2.sigver import get_xmlsec_binary
from sentry_sdk.integrations.django import DjangoIntegration

from shared.suomi_fi.utils import get_contact_person_configuration

checkout_dir = environ.Path(__file__) - 2
assert os.path.exists(checkout_dir("manage.py"))

parent_dir = checkout_dir.path("..")
if os.path.isdir(parent_dir("etc")):
    env_file = parent_dir("etc/env")
    default_var_root = environ.Path(parent_dir("var"))
else:
    env_file = checkout_dir(".env.kesaseteli")
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
    SENTRY_ATTACH_STACKTRACE=(bool, False),
    SENTRY_MAX_BREADCRUMBS=(int, 0),
    SENTRY_REQUEST_BODIES=(str, "never"),
    SENTRY_SEND_DEFAULT_PII=(bool, False),
    SENTRY_WITH_LOCALS=(bool, False),
    CORS_ALLOWED_ORIGINS=(list, []),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    CSRF_COOKIE_DOMAIN=(str, "localhost"),
    CSRF_TRUSTED_ORIGINS=(list, []),
    CSRF_COOKIE_NAME=(str, "yjdhcsrftoken"),
    YTJ_BASE_URL=(str, "http://avoindata.prh.fi/opendata/tr/v1"),
    YTJ_TIMEOUT=(int, 30),
    NEXT_PUBLIC_MOCK_FLAG=(bool, False),
    SESSION_COOKIE_AGE=(int, 60 * 60 * 2),
    OIDC_RP_CLIENT_ID=(str, ""),
    OIDC_RP_CLIENT_SECRET=(str, ""),
    OIDC_OP_BASE_URL=(str, ""),
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
    AZURE_ACCOUNT_KEY=(str, ""),
    AZURE_CONTAINER=(str, ""),
    AUDIT_LOG_ORIGIN=(str, ""),
    # Random 32 bytes AES key, for testing purpose only, DO NOT use it value in staging/production
    # Always override this value from env variables
    ENCRYPTION_KEY=(
        str,
        "f164ec6bd6fbc4aef5647abc15199da0f9badcc1d2127bde2087ae0d794a9a0b",
    ),
    SOCIAL_SECURITY_NUMBER_HASH_KEY=(
        str,
        "ee235e39ebc238035a6264c063dd829d4b6d2270604b57ee1f463e676ec44669",
    ),
    ELASTICSEARCH_APP_AUDIT_LOG_INDEX=(str, "kesaseteli_audit_log"),
    ELASTICSEARCH_HOST=(str, ""),
    ELASTICSEARCH_PORT=(str, ""),
    ELASTICSEARCH_USERNAME=(str, ""),
    ELASTICSEARCH_PASSWORD=(str, ""),
    CLEAR_AUDIT_LOG_ENTRIES=(bool, False),
    ENABLE_SEND_AUDIT_LOG=(bool, False),
    ENABLE_ADMIN=(bool, False),
    DB_PREFIX=(str, ""),
    EMAIL_USE_TLS=(bool, False),
    EMAIL_HOST=(str, "ema.platta-net.hel.fi"),
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
)
if os.path.exists(env_file):
    env.read_env(env_file)

BASE_DIR = str(checkout_dir)

DEBUG = env.bool("DEBUG")
SECRET_KEY = env.str("SECRET_KEY")
if DEBUG and not SECRET_KEY:
    SECRET_KEY = "xxx"
ENCRYPTION_KEY = env.str("ENCRYPTION_KEY")
SOCIAL_SECURITY_NUMBER_HASH_KEY = env.str("SOCIAL_SECURITY_NUMBER_HASH_KEY")
ENABLE_ADMIN = env.bool("ENABLE_ADMIN")
NEXT_PUBLIC_DISABLE_VTJ = env.bool("NEXT_PUBLIC_DISABLE_VTJ")
VTJ_PERSONAL_ID_QUERY_URL = env.str("VTJ_PERSONAL_ID_QUERY_URL")
VTJ_USERNAME = env.str("VTJ_USERNAME")
VTJ_PASSWORD = env.str("VTJ_PASSWORD")
VTJ_TIMEOUT = env.int("VTJ_TIMEOUT")
NEXT_PUBLIC_ENABLE_SUOMIFI = env("NEXT_PUBLIC_ENABLE_SUOMIFI")

DB_PREFIX = {
    None: env.str("DB_PREFIX"),
}

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
USE_X_FORWARDED_HOST = env.bool("USE_X_FORWARDED_HOST")

DATABASES = {"default": env.db()}

CACHES = {"default": env.cache()}

SENTRY_ATTACH_STACKTRACE = env.bool("SENTRY_ATTACH_STACKTRACE")
SENTRY_MAX_BREADCRUMBS = env.int("SENTRY_MAX_BREADCRUMBS")
SENTRY_REQUEST_BODIES = env.str("SENTRY_REQUEST_BODIES")
SENTRY_SEND_DEFAULT_PII = env.bool("SENTRY_SEND_DEFAULT_PII")
SENTRY_WITH_LOCALS = env.bool("SENTRY_WITH_LOCALS")

sentry_sdk.init(
    attach_stacktrace=SENTRY_ATTACH_STACKTRACE,
    max_breadcrumbs=SENTRY_MAX_BREADCRUMBS,
    request_bodies=SENTRY_REQUEST_BODIES,
    send_default_pii=SENTRY_SEND_DEFAULT_PII,
    with_locals=SENTRY_WITH_LOCALS,
    dsn=env.str("SENTRY_DSN"),
    release="n/a",
    environment=env("SENTRY_ENVIRONMENT"),
    integrations=[DjangoIntegration()],
)

MEDIA_ROOT = env("MEDIA_ROOT")
STATIC_ROOT = env("STATIC_ROOT")
MEDIA_URL = env.str("MEDIA_URL")
STATIC_URL = env.str("STATIC_URL")
YOUTH_URL = env.str("YOUTH_URL")
HANDLER_URL = env.str("HANDLER_URL")
NEXT_PUBLIC_BACKEND_URL = env("NEXT_PUBLIC_BACKEND_URL")

ROOT_URLCONF = "kesaseteli.urls"
WSGI_APPLICATION = "kesaseteli.wsgi.application"

LANGUAGE_CODE = "fi"
LANGUAGES = (("fi", _("Finnish")), ("en", _("English")), ("sv", _("Swedish")))
TIME_ZONE = "Europe/Helsinki"
USE_I18N = True
USE_L10N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "mozilla_django_oidc",
    "django_extensions",
    "django_auth_adfs",
    "sequences.apps.SequencesConfig",
    # shared apps
    "shared.audit_log",
    "shared.oidc",
    # local apps
    "applications",
    "companies",
]

if NEXT_PUBLIC_ENABLE_SUOMIFI:
    INSTALLED_APPS.append("djangosaml2")

if ENABLE_ADMIN:
    INSTALLED_APPS.append("django.contrib.admin")

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

if NEXT_PUBLIC_ENABLE_SUOMIFI:
    MIDDLEWARE.insert(
        MIDDLEWARE.index("simple_history.middleware.HistoryRequestMiddleware"),
        "djangosaml2.middleware.SamlSessionMiddleware",
    )

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
HANDLER_EMAIL = env.str("HANDLER_EMAIL")
NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS = env.int(
    "NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS"
)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS")
CSRF_COOKIE_DOMAIN = env.str("CSRF_COOKIE_DOMAIN")
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS")
CSRF_COOKIE_NAME = env.str("CSRF_COOKIE_NAME")
CSRF_COOKIE_SECURE = True

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
        "django": {"handlers": ["console"], "level": "WARNING"},
    },
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication"
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

YTJ_BASE_URL = env.str("YTJ_BASE_URL")
YTJ_TIMEOUT = env.int("YTJ_TIMEOUT")

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
    "shared.suomi_fi.auth.SuomiFiSAML2AuthenticationBackend"
    if NEXT_PUBLIC_ENABLE_SUOMIFI
    else "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
)

OIDC_RP_SIGN_ALGO = "RS256"
OIDC_RP_SCOPES = "openid profile"

OIDC_RP_CLIENT_ID = env.str("OIDC_RP_CLIENT_ID")
OIDC_RP_CLIENT_SECRET = env.str("OIDC_RP_CLIENT_SECRET")

OIDC_OP_BASE_URL = env.str("OIDC_OP_BASE_URL")
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
    "CLAIM_MAPPING": {"email": "mail"},
    "USERNAME_CLAIM": "oid",
    "TENANT_ID": ADFS_TENANT_ID,
    "RELYING_PARTY_ID": ADFS_CLIENT_ID,
}

ADFS_LOGIN_REDIRECT_URL = env.str("ADFS_LOGIN_REDIRECT_URL")
ADFS_LOGIN_REDIRECT_URL_FAILURE = env.str("ADFS_LOGIN_REDIRECT_URL_FAILURE")

ADFS_CONTROLLER_GROUP_UUIDS = env.list("ADFS_CONTROLLER_GROUP_UUIDS")


# Suomi.fi (djangosaml2)

SAML_ATTRIBUTE_MAPPING = {
    "givenName": ("first_name",),
    "sn": ("last_name",),
}
SAML_SESSION_COOKIE_NAME = "kesaseteli_saml_session"
SAML_CREATE_UNKNOWN_USER = True
SAML_DJANGO_USER_MAIN_ATTRIBUTE = "username"
SAML_USE_NAME_ID_AS_USERNAME = True  # Suomi.fi session ID as username
SAML_IGNORE_LOGOUT_ERRORS = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

ACS_DEFAULT_REDIRECT_URL = reverse_lazy("eauth_authentication_init")
SUOMIFI_TEST = env("SUOMIFI_TEST")
if NEXT_PUBLIC_MOCK_FLAG:
    SUOMIFI_SERVICE_NAME_EXTRA = "MOCK"
else:
    SUOMIFI_SERVICE_NAME_EXTRA = env("SUOMIFI_SERVICE_NAME_EXTRA")

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
                        "text": "https://nuorten.helsinki/opiskelu-ja-tyo/kesaseteli/",
                        "lang": "fi",
                    },
                    {
                        "text": "https://nuorten.hel.fi/sv/studier-och-jobb/sommarsedeln/",
                        "lang": "sv",
                    },
                    {
                        "text": "https://nuorten.hel.fi/en/studies-and-work/the-summer-job-voucher/",
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
    # Test authentication method which is only available in the customer testing environment
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

AZURE_ACCOUNT_NAME = env("AZURE_ACCOUNT_NAME")
AZURE_ACCOUNT_KEY = env("AZURE_ACCOUNT_KEY")
AZURE_CONTAINER = env("AZURE_CONTAINER")

MAX_UPLOAD_SIZE = 10485760  # 10MB

# local_settings.py can be used to override environment-specific settings
# like database and email that differ between development and production.
local_settings_path = os.path.join(checkout_dir(), "local_settings.py")
if os.path.exists(local_settings_path):
    with open(local_settings_path) as fp:
        code = compile(fp.read(), local_settings_path, "exec")
    exec(code, globals(), locals())
