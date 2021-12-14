"""
Django settings for tet project.

Generated by 'django-admin startproject' using Django 3.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

import os

import environ

checkout_dir = environ.Path(__file__) - 2
assert os.path.exists(checkout_dir("manage.py"))

BASE_DIR = str(checkout_dir)

parent_dir = checkout_dir.path("..")
if os.path.isdir(parent_dir("etc")):
    env_file = parent_dir("etc/env")
    default_var_root = environ.Path(parent_dir("var"))
else:
    env_file = checkout_dir(".env.tet")
    default_var_root = environ.Path(checkout_dir("var"))

django_env = environ.Env(
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
        "postgres:///tet",
    ),
    CACHE_URL=(str, "locmemcache://"),
    SENTRY_DSN=(str, ""),
    SENTRY_ENVIRONMENT=(str, ""),
    CORS_ALLOWED_ORIGINS=(list, []),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    CSRF_COOKIE_DOMAIN=(str, "localhost"),
    CSRF_TRUSTED_ORIGINS=(list, []),
    MOCK_FLAG=(bool, False),
    SESSION_COOKIE_AGE=(int, 3600 * 2),
    OIDC_RP_CLIENT_ID=(str, ""),
    OIDC_RP_CLIENT_SECRET=(str, ""),
    OIDC_OP_BASE_URL=(str, ""),
    LOGIN_REDIRECT_URL=(str, "/"),
    LOGIN_REDIRECT_URL_FAILURE=(str, "/"),
    ADFS_LOGIN_REDIRECT_URL=(str, "/set-this-later/"),
    ADFS_LOGIN_REDIRECT_URL_FAILURE=(str, "/"),
    EAUTHORIZATIONS_BASE_URL=(str, ""),
    EAUTHORIZATIONS_CLIENT_ID=(str, ""),
    EAUTHORIZATIONS_CLIENT_SECRET=(str, ""),
    EAUTHORIZATIONS_API_OAUTH_SECRET=(str, ""),
    ADFS_CLIENT_ID=(str, "test_client_id"), # TODO needs to be "client_id"?
    ADFS_CLIENT_SECRET=(str, "test_client_secret"),
    ADFS_TENANT_ID=(str, "test_tenant_id"),
    ADFS_CONTROLLER_GROUP_UUIDS=(list, []),
    DEFAULT_FILE_STORAGE=(str, "django.core.files.storage.FileSystemStorage"),
    AZURE_ACCOUNT_NAME=(str, ""),
    AZURE_ACCOUNT_KEY=(str, ""),
    AZURE_CONTAINER=(str, ""),
    AUDIT_LOG_ORIGIN=(str, ""),
    # For testing purpose only, DO NOT use it value in staging/production
    # Always override this value from environment
    ENCRYPTION_KEY=(
        str,
        "f164ec6bd6fbc4aef5647abc15199da0f9badcc1d2127bde2087ae0d794a9a0b",
    ),
    ELASTICSEARCH_APP_AUDIT_LOG_INDEX=(str, "tet_audit_log"),
    ELASTICSEARCH_CLOUD_ID=(str, ""),
    ELASTICSEARCH_API_ID=(str, ""),
    ELASTICSEARCH_API_KEY=(str, ""),
    CLEAR_AUDIT_LOG_ENTRIES=(bool, False),
    ENABLE_SEND_AUDIT_LOG=(bool, False),
    ENABLE_ADMIN=(bool, True),
    DB_PREFIX=(str, ""),
)

if os.path.exists(env_file):
    django_env.read_env(env_file)

BASE_DIR = str(checkout_dir)

DEBUG = django_env.bool("DEBUG")
SECRET_KEY = django_env.str("SECRET_KEY")
if DEBUG and not SECRET_KEY:
    SECRET_KEY = "xxxx"


DEBUG = False

ALLOWED_HOSTS = django_env.list("ALLOWED_HOSTS")

DATABASES = {"default": django_env.db()}

CACHES = {"default": django_env.cache()}

MEDIA_ROOT = django_env("MEDIA_ROOT")
STATIC_ROOT = django_env("STATIC_ROOT")
MEDIA_URL = django_env.str("MEDIA_URL")
STATIC_URL = django_env.str("STATIC_URL")
ENABLE_ADMIN = django_env.bool("ENABLE_ADMIN")
ENCRYPTION_KEY = django_env.str("ENCRYPTION_KEY")

ROOT_URLCONF = "tet.urls"
WSGI_APPLICATION = "tet.wsgi.application"

LANGUAGE_CODE = "fi"
TIME_ZONE = "Europe/Helsinki"
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# Application definition

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
    # shared apps
    "shared.audit_log",
    "shared.oidc",
    # local apps
]

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

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = django_env.list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_ALL_ORIGINS = django_env.bool("CORS_ALLOW_ALL_ORIGINS")
CSRF_COOKIE_DOMAIN = django_env.str("CSRF_COOKIE_DOMAIN")
CSRF_TRUSTED_ORIGINS = django_env.list("CSRF_TRUSTED_ORIGINS")
CSRF_COOKIE_SECURE = True

# Audit log
ENABLE_SEND_AUDIT_LOG = django_env("ENABLE_SEND_AUDIT_LOG")
AUDIT_LOG_ORIGIN = django_env.str("AUDIT_LOG_ORIGIN")
CLEAR_AUDIT_LOG_ENTRIES = django_env.bool("CLEAR_AUDIT_LOG_ENTRIES")
ELASTICSEARCH_APP_AUDIT_LOG_INDEX = django_env("ELASTICSEARCH_APP_AUDIT_LOG_INDEX")
ELASTICSEARCH_CLOUD_ID = django_env("ELASTICSEARCH_CLOUD_ID")
ELASTICSEARCH_API_ID = django_env("ELASTICSEARCH_API_ID")
ELASTICSEARCH_API_KEY = django_env("ELASTICSEARCH_API_KEY")


LOGGING = {
    "disable_existing_loggers": False,
    "version": 1,
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

# Configure REST Framework

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication"
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

# Mock flag for testing purposes
MOCK_FLAG = django_env.bool("MOCK_FLAG")

# Auth
SESSION_COOKIE_AGE = django_env.int("SESSION_COOKIE_AGE")
SESSION_COOKIE_SECURE = True

AUTHENTICATION_BACKENDS = (
    "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend",
    "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
    "django.contrib.auth.backends.ModelBackend",
)

OIDC_RP_SIGN_ALGO = "RS256"
OIDC_RP_SCOPES = "openid profile"

OIDC_RP_CLIENT_ID = django_env.str("OIDC_RP_CLIENT_ID")
OIDC_RP_CLIENT_SECRET = django_env.str("OIDC_RP_CLIENT_SECRET")

OIDC_OP_BASE_URL = django_env.str("OIDC_OP_BASE_URL")
OIDC_OP_AUTHORIZATION_ENDPOINT = f"{OIDC_OP_BASE_URL}/auth"
OIDC_OP_TOKEN_ENDPOINT = f"{OIDC_OP_BASE_URL}/token"
OIDC_OP_USER_ENDPOINT = f"{OIDC_OP_BASE_URL}/userinfo"
OIDC_OP_JWKS_ENDPOINT = f"{OIDC_OP_BASE_URL}/certs"
OIDC_OP_LOGOUT_ENDPOINT = f"{OIDC_OP_BASE_URL}/logout"

LOGIN_REDIRECT_URL = django_env.str("LOGIN_REDIRECT_URL")
LOGIN_REDIRECT_URL_FAILURE = django_env.str("LOGIN_REDIRECT_URL_FAILURE")

EAUTHORIZATIONS_BASE_URL = django_env.str("EAUTHORIZATIONS_BASE_URL")
EAUTHORIZATIONS_CLIENT_ID = django_env.str("EAUTHORIZATIONS_CLIENT_ID")
EAUTHORIZATIONS_CLIENT_SECRET = django_env.str("EAUTHORIZATIONS_CLIENT_SECRET")
EAUTHORIZATIONS_API_OAUTH_SECRET = django_env.str("EAUTHORIZATIONS_API_OAUTH_SECRET")

# Azure ADFS
LOGIN_URL = "django_auth_adfs:login"

ADFS_CLIENT_ID = django_env.str("ADFS_CLIENT_ID") or "client_id"
ADFS_CLIENT_SECRET = django_env.str("ADFS_CLIENT_SECRET") or "client_secret"
ADFS_TENANT_ID = django_env.str("ADFS_TENANT_ID") or "tenant_id"

# https://django-auth-adfs.readthedocs.io/en/latest/azure_ad_config_guide.html#step-2-configuring-settings-py
AUTH_ADFS = {
    "AUDIENCE": ADFS_CLIENT_ID,
    "CLIENT_ID": ADFS_CLIENT_ID,
    "CLIENT_SECRET": ADFS_CLIENT_SECRET,
    "CLAIM_MAPPING": {"email": "email"},
    "USERNAME_CLAIM": "oid",
    "TENANT_ID": ADFS_TENANT_ID,
    "RELYING_PARTY_ID": ADFS_CLIENT_ID,
}

ADFS_LOGIN_REDIRECT_URL = django_env.str("ADFS_LOGIN_REDIRECT_URL")
ADFS_LOGIN_REDIRECT_URL_FAILURE = django_env.str("ADFS_LOGIN_REDIRECT_URL_FAILURE")

ADFS_CONTROLLER_GROUP_UUIDS = django_env.list("ADFS_CONTROLLER_GROUP_UUIDS")
# End of Authentication

FIELD_ENCRYPTION_KEYS = [ENCRYPTION_KEY]

# Django storages
DEFAULT_FILE_STORAGE = django_env("DEFAULT_FILE_STORAGE")

AZURE_ACCOUNT_NAME = django_env("AZURE_ACCOUNT_NAME")
AZURE_ACCOUNT_KEY = django_env("AZURE_ACCOUNT_KEY")
AZURE_CONTAINER = django_env("AZURE_CONTAINER")

MAX_UPLOAD_SIZE = 10485760  # 10MB

# local_settings.py can be used to override environment-specific settings
# like database and email that differ between development and production.
local_settings_path = os.path.join(checkout_dir(), "local_settings.py")
if os.path.exists(local_settings_path):
    with open(local_settings_path) as fp:
        code = compile(fp.read(), local_settings_path, "exec")
    exec(code, globals(), locals())
