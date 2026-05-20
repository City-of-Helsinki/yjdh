"""
DVV compliance logging for Suomi.fi authentication, mandate (eAuthorization),
and VTJ (Population Information System) query events.

Background
----------
Kesäseteli uses Suomi.fi for two distinct purposes and also queries the Finnish
Population Information System (VTJ) during application handling:

1. **Personal identification (SAML2 / SuomiFi login)**
   Users authenticate via Suomi.fi's SAML2 identity broker. After a successful
   authentication the Django ``user_logged_in`` signal fires, which this module
   intercepts to write a LOGIN log entry.

2. **eAuthorization / mandating (Suomi.fi Valtuudet)**
   An employer may grant a representative the right to act on behalf of their
   company inside Kesäseteli. When a user logs in and their session is associated
   with a company, Kesäseteli queries the Suomi.fi Valtuudet (eAuthorizations)
   REST API to verify that the user holds a valid mandate for that company and to
   retrieve the list of roles granted. This module logs both successful and failed
   mandate queries as MANDATE_QUERY entries.

3. **VTJ personal information queries**
   Kesäseteli queries the VTJ REST API to verify an applicant's identity and
   home municipality in two situations:

   * Automatically by the system when a youth submits their youth application,
     to check if the application can be automatically accepted.
   * Manually by a handler (caseworker) when they open a youth application for
     processing (if the application was not automatically accepted).

   This module logs both successful and failed queries as VTJ_QUERY entries.

DVV logging requirements — Suomi.fi Valtuudet (mandate)
--------------------------------------------------------
DVV (Digi- ja väestötietovirasto) requires all services using Suomi.fi Valtuudet
to retain transaction records for on-behalf-of (mandate) activities for at least
**five (5) years** from the time of the transaction, unless applicable legislation
specifies a different period (support service legislation / tukipalvelulaki).

The audit trail must make the following facts recoverable after the fact:

* **Who acted** – the representative (puolesta-asioija), identified by user ID.
* **On whose behalf** – the principal company, identified by Y-tunnus (business ID).
* **Which query** – the unique requestId generated for the API call to Suomi.fi.
* **When** – timestamps of both the query sent to Suomi.fi Valtuudet and the
  response received (handled automatically by ``django-resilient-logger``).
* **What the result was** – the mandate roles returned and whether the query
  succeeded or failed.

See: https://kehittajille.suomi.fi/palvelut/valtuudet/tekninen-dokumentaatio/lokitusvaatimukset

DVV logging requirements — VTJ queries
---------------------------------------
The permit holder (luvansaaja) is responsible for maintaining a log of all
queries made to the Population Information System. Logs must be retained for
**five (5) years** as a general rule. The log must record:

* **Who made the query** – identified at the individual (person) level.
* **What data was queried** – which fields / query type were requested from VTJ.
* **When** – full date and time (pp.kk.vvvv klo).

See: https://dvv.fi/vtjkysely-rajapinta

Implementation
--------------
Entries are written via ``ResilientLogSource.create()`` from the
``django-resilient-logger`` library. Entries are stored locally in the
``resilient_logger_resilientlogentry`` database table and shipped to
Elasticsearch on a schedule by the ``submit_unsent_entries`` management command
(run every 15 minutes by the quarter-hourly job in
``kesaseteli/jobs/quarter_hourly/submit_resilient_log.py``).

All logging is gated behind the ``ENABLE_AUTH_LOGGING`` Django setting
(default: ``False``). Set ``ENABLE_AUTH_LOGGING=True`` in the environment to
activate logging in production.

The ``on_user_logged_in`` Django signal receiver at the bottom of this module is
registered by importing the module inside ``KesaseteliProjectConfig.ready()``
in ``apps.py``. No entries are written until ``ENABLE_AUTH_LOGGING`` is ``True``.
"""

import logging
from enum import StrEnum
from functools import wraps

from django.conf import settings
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from resilient_logger.sources import ResilientLogSource

from shared.oidc.signals import (
    suomifi_mandate_queried,
    suomifi_mandate_query_failed,
)
from shared.vtj.signals import (
    vtj_queried,
    vtj_query_failed,
)
from shared.vtj.vtj_client import VTJClient


class AuthEventType(StrEnum):
    """Stable string identifiers for auth event types stored in log entry context.

    These values are written to the ``event_type`` field of every
    ``ResilientLogEntry`` produced by this module and will appear verbatim in
    Elasticsearch. Do not rename existing members without a data migration.
    """

    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    MANDATE_QUERY = "MANDATE_QUERY"
    VTJ_QUERY = "VTJ_QUERY"


class AuthEventMessage(StrEnum):
    """Human-readable log messages paired with each ``AuthEventType``.

    Used as the top-level ``message`` field on ``ResilientLogEntry``.
    """

    LOGIN = "User login"
    LOGOUT = "User logout"
    MANDATE_QUERY = "Mandate authorization query"
    MANDATE_QUERY_FAILED = "Mandate authorization query failed"
    VTJ_QUERY = "VTJ personal information query"
    VTJ_QUERY_FAILED = "VTJ personal information query failed"


class VtjQueryType(StrEnum):
    """VTJ query types used in compliance logs."""

    PERSONAL_DATA_QUERY = VTJClient.DEFAULT_QUERY_TYPE


def _requires_auth_logging(fn):
    """Decorator that short-circuits logging functions when ENABLE_AUTH_LOGGING is off.

    Wraps a logging function so that it becomes a no-op if the
    ``ENABLE_AUTH_LOGGING`` setting is falsy. This keeps all call sites clean
    and avoids scattering the guard condition across the codebase.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not settings.ENABLE_AUTH_LOGGING:
            return None
        return fn(*args, **kwargs)

    return wrapper


@_requires_auth_logging
def log_login_event(request, user):
    """Write a LOGIN compliance entry when a user authenticates via Suomi.fi.

    Called from the ``on_user_logged_in`` signal receiver below. Captures the
    minimum set of fields required by DVV for login audit trails: who logged in,
    via which authentication backend, and from which IP address.

    Args:
        request: The current Django ``HttpRequest``. Used to read ``REMOTE_ADDR``.
        user: The authenticated Django ``User`` instance. ``user.backend`` is
            set by Django's auth framework immediately before the signal fires
            and contains the dotted path of the backend that authenticated the
            user (e.g. ``shared.suomi_fi.auth.SuomiFiSAML2AuthenticationBackend`` 
            for Suomi.fi SAML2 logins).
    """
    ResilientLogSource.create(
        level=logging.INFO,
        message=AuthEventMessage.LOGIN,
        context={
            "event_type": AuthEventType.LOGIN,
            "user_id": str(user.pk),
            "auth_backend": getattr(user, "backend", "unknown"),
            "ip_address": request.META.get("REMOTE_ADDR"),
        },
    )


@_requires_auth_logging
def log_logout_event(request, user):
    """Write a LOGOUT compliance entry when a user logs out.

    Called from the ``on_user_logged_out`` signal receiver below.

    Args:
        request: The current Django ``HttpRequest``.
        user: The Django ``User`` instance that is logging out.
    """
    ResilientLogSource.create(
        level=logging.INFO,
        message=AuthEventMessage.LOGOUT,
        context={
            "event_type": AuthEventType.LOGOUT,
            "user_id": str(user.pk) if user else "unknown",
            "ip_address": request.META.get("REMOTE_ADDR"),
        },
    )


@receiver(suomifi_mandate_queried)
@_requires_auth_logging
def on_suomifi_mandate_queried(
    sender, request, request_id, organization_roles, **kwargs
):
    """Write a successful MANDATE_QUERY compliance entry for a Suomi.fi Valtuudet query.

    Triggered by the ``suomifi_mandate_queried`` signal emitted from
    ``shared.oidc.utils.request_organization_roles`` after a successful live
    API call to the Suomi.fi Valtuudet REST API. Captures the fields required
    by DVV to reconstruct the mandate event.

    Args:
        sender: The function that sent the signal.
        request: The current Django ``HttpRequest``, used to extract the user.
        request_id: The unique ID generated for the API query.
        organization_roles: The dict returned by the API containing roles.
    """
    user = getattr(request, "user", None)
    if not request_id:
        return

    ResilientLogSource.create(
        level=logging.INFO,
        message=AuthEventMessage.MANDATE_QUERY,
        context={
            "event_type": AuthEventType.MANDATE_QUERY,
            "user_id": str(user.pk) if user and user.is_authenticated else None,
            "company_identifier": organization_roles.get("identifier"),
            "company_name": organization_roles.get("name"),
            "request_id": request_id,
            "roles": organization_roles.get("roles", []),
            "query_complete": organization_roles.get("complete"),
            "success": True,
        },
    )


@receiver(suomifi_mandate_query_failed)
@_requires_auth_logging
def on_suomifi_mandate_query_failed(sender, request, request_id, error, **kwargs):
    """Write a failed MANDATE_QUERY compliance entry when the mandate query fails.

    Triggered by the ``suomifi_mandate_query_failed`` signal emitted from
    ``shared.oidc.utils.request_organization_roles``.

    Args:
        sender: The function that sent the signal.
        request: The current Django ``HttpRequest``, used to extract the user.
        request_id: The unique ID generated for the API query.
        error: The exception that caused the failure.
    """
    user = getattr(request, "user", None)

    ResilientLogSource.create(
        level=logging.WARNING,
        message=AuthEventMessage.MANDATE_QUERY_FAILED,
        context={
            "event_type": AuthEventType.MANDATE_QUERY,
            "user_id": str(user.pk) if user and user.is_authenticated else None,
            "request_id": request_id,
            "success": False,
            "error": str(error),
        },
    )


@receiver(vtj_queried)
@_requires_auth_logging
def on_vtj_queried(sender, end_user, social_security_number, **kwargs):
    """Write a successful VTJ_QUERY compliance entry for a VTJ personal info query.

    Triggered by the ``vtj_queried`` signal emitted from
    ``shared.vtj.vtj_client.VTJClient``.

    Args:
        sender: The class that sent the signal.
        end_user: The identifier of the handler (caseworker) who triggered the query.
        social_security_number: The Finnish personal identity code queried.
    """
    ResilientLogSource.create(
        level=logging.INFO,
        message=AuthEventMessage.VTJ_QUERY,
        context={
            "event_type": AuthEventType.VTJ_QUERY,
            "end_user": end_user,
            "social_security_number": social_security_number,
            "query_type": VtjQueryType.PERSONAL_DATA_QUERY,
            "success": True,
        },
    )


@receiver(vtj_query_failed)
@_requires_auth_logging
def on_vtj_query_failed(sender, end_user, social_security_number, error, **kwargs):
    """Write a failed VTJ_QUERY compliance entry when a VTJ query fails.

    Triggered by the ``vtj_query_failed`` signal emitted from
    ``shared.vtj.vtj_client.VTJClient``.

    Args:
        sender: The class that sent the signal.
        end_user: The identifier of the handler who triggered the query.
        social_security_number: The personal identity code that was being queried.
        error: The exception that caused the failure.
    """
    ResilientLogSource.create(
        level=logging.WARNING,
        message=AuthEventMessage.VTJ_QUERY_FAILED,
        context={
            "event_type": AuthEventType.VTJ_QUERY,
            "end_user": end_user,
            "social_security_number": social_security_number,
            "query_type": VtjQueryType.PERSONAL_DATA_QUERY,
            "success": False,
            "error": str(error),
        },
    )


@receiver(user_logged_in)
def on_user_logged_in(sender, request, user, **kwargs):
    """Django signal receiver — logs a LOGIN entry on every successful authentication.

    Registered by importing this module in ``KesaseteliProjectConfig.ready()``
    (``apps.py``). The ``@receiver`` decorator connects this function to
    Django's built-in ``user_logged_in`` signal, which fires after any
    successful call to ``django.contrib.auth.login()``, including logins
    performed by Suomi.fi SAML2.

    The actual log write is delegated to ``log_login_event`` and is a no-op
    when ``ENABLE_AUTH_LOGGING`` is ``False``.
    """
    log_login_event(request, user)


@receiver(user_logged_out)
def on_user_logged_out(sender, request, user, **kwargs):
    """Django signal receiver — logs a LOGOUT entry on every logout.

    The actual log write is delegated to ``log_logout_event`` and is a no-op
    when ``ENABLE_AUTH_LOGGING`` is ``False``.
    """
    log_logout_event(request, user)
