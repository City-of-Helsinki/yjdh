# Auth & Mandate Compliance Logging

Kesäseteli uses Suomi.fi for authentication and authorization, and queries the
Finnish Population Information System (VTJ) during application handling. All
three flows produce compliance log entries that DVV requires to be retained for
at least **five years**.

## Background

### 1. Personal identification — Suomi.fi SAML2 login

Users authenticate via the Suomi.fi identity broker using SAML2. After a
successful login Django fires the `user_logged_in` signal, and after a
successful logout it fires the `user_logged_out` signal. Both are intercepted
by this module to write `LOGIN` and `LOGOUT` log entries.

### 2. eAuthorization / mandating — Suomi.fi Valtuudet

An employer can grant a representative the right to act on behalf of their
company (Finnish: *puolesta-asiointi*). When a user's session is linked to a
company, Kesäseteli queries the Suomi.fi Valtuudet (eAuthorizations) REST API
to verify that the user holds a valid mandate and to retrieve the list of roles
granted. Both successful and failed queries are logged as `MANDATE_QUERY`
entries.

### 3. Population information queries — VTJ

When a handler (caseworker) reviews a youth application, Kesäseteli queries the
VTJ (Väestötietojärjestelmä / Population Information System) REST API to verify
the applicant's identity and home municipality. Both successful and failed
queries are logged as `VTJ_QUERY` entries.

`VTJClient` lives in the shared library and is intentionally unaware of this
logging. All VTJ logging is performed at the Kesäseteli call site
(`applications/services.py`) so that the shared client remains generic and
reusable across services.

## DVV logging requirements — Suomi.fi Valtuudet (mandate)

DVV (Digi- ja väestötietovirasto) mandates that all services using Suomi.fi
Valtuudet retain transaction records for on-behalf-of activities for at least
**five (5) years** from the time of the transaction, unless applicable
legislation specifies a different period (support service legislation /
*tukipalvelulaki*).

The retained records must make the following facts recoverable after the fact:

| Requirement | Logged field |
|---|---|
| Who acted (representative / *puolesta-asioija*) | `actor.user_id` |
| On whose behalf (principal company) | `target.company_identifier` (Y-tunnus), `target.company_name` |
| When the query was made | Timestamp recorded automatically by `django-resilient-logger` |
| When the response was received | Timestamp recorded automatically by `django-resilient-logger` |
| What roles / authorizations were returned | `roles`, `query_complete` |
| Whether the query succeeded | `success` |

Personal data in log entries may be pseudonymised if required by other
applicable legislation.

Reference: https://kehittajille.suomi.fi/palvelut/valtuudet/tekninen-dokumentaatio/lokitusvaatimukset

## DVV logging requirements — VTJ queries

The permit holder (*luvansaaja*) is responsible for maintaining a log of all
queries made to the Population Information System. Logs must be retained for
**five (5) years** as a general rule. The log must record:

| Requirement | Logged field |
|---|---|
| Who made the query (person level) | `actor.user_id` |
| What data was queried | `target.social_security_number`, `query_type` |
| When the query was made | Timestamp recorded automatically by `django-resilient-logger` |
| Whether the query succeeded | `success` |

Reference: https://dvv.fi/vtjkysely-rajapinta

## Log entry structure (context)

### LOGIN

Written on every successful Suomi.fi SAML2 authentication.

```json
{
  "operation": "LOGIN",
  "actor": {
    "user_id": "<Django user PK>"
  },
  "target": {
    "user_id": "<Django user PK>"
  },
  "auth_backend": "shared.suomi_fi.auth.SuomiFiSAML2AuthenticationBackend",
  "ip_address": "1.2.3.4"
}
```

### LOGOUT

Written on every manual or SAML Single Logout (SLO).

```json
{
  "operation": "LOGOUT",
  "actor": {
    "user_id": "<Django user PK>"
  },
  "target": {
    "user_id": "<Django user PK>"
  },
  "ip_address": "1.2.3.4"
}
```

### MANDATE_QUERY (success)

Written after a successful Suomi.fi Valtuudet API call.

```json
{
  "operation": "MANDATE_QUERY",
  "actor": {
    "user_id": "<Django user PK>"
  },
  "target": {
    "user_id": "<Django user PK>",
    "company_identifier": "1234567-8",
    "company_name": "Example Oy"
  },
  "roles": ["NIMKO"],
  "query_complete": true,
  "success": true,
  "request_id": "req-123"
}
```

### MANDATE_QUERY (failure)

Written when the Suomi.fi Valtuudet API call raises a `RequestException`.

```json
{
  "operation": "MANDATE_QUERY",
  "actor": {
    "user_id": "<Django user PK>"
  },
  "target": {
    "user_id": "<Django user PK>"
  },
  "success": false,
  "error": "Connection refused",
  "request_id": "req-123"
}
```

### VTJ_QUERY (success)

Written after a successful VTJ personal information query.

```json
{
  "operation": "VTJ_QUERY",
  "actor": {
    "user_id": "<handler UUID or 'system'>"
  },
  "target": {
    "social_security_number": "010101-123N"
  },
  "query_type": "PERUSSANOMA 1",
  "success": true,
  "request_id": "req-vtj-123"
}
```

### VTJ_QUERY (failure)

Written when the VTJ API call raises a `RequestException`.

```json
{
  "operation": "VTJ_QUERY",
  "actor": {
    "user_id": "<handler UUID or 'system'>"
  },
  "target": {
    "social_security_number": "010101-123N"
  },
  "query_type": "PERUSSANOMA 1",
  "success": false,
  "error": "Connection refused",
  "request_id": "req-vtj-123"
}
```

## Implementation

### Library

`django-resilient-logger` is used for all compliance logging. It stores entries
locally in the `resilient_logger_resilientlogentry` database table and ships
them to Elasticsearch on a schedule. This ensures entries survive transient
network outages between the application and Elasticsearch.

### Shipping to Elasticsearch

The `submit_unsent_entries` management command ships pending entries to
Elasticsearch. It is run every 15 minutes by the quarter-hourly job at
`kesaseteli/jobs/quarter_hourly/submit_resilient_log.py`, which is discovered
automatically by `django-extensions`.

### Enabling logging

All logging is gated behind the `ENABLE_AUTH_LOGGING` Django setting.

```
ENABLE_AUTH_LOGGING=True   # enable in production
ENABLE_AUTH_LOGGING=False  # default — no entries are written
```

### Signal wiring

The `on_user_logged_in` and `on_user_logged_out` receivers in `auth_logging.py`
are connected to Django's built-in signals by importing the module inside
`KesaseteliProjectConfig.ready()` in `apps.py`. No entries are written until
`ENABLE_AUTH_LOGGING` is `True`.

## Related files

| File | Purpose |
|---|---|
| `kesaseteli/auth_logging.py` | Log functions, enums, and signal receiver |
| `kesaseteli/apps.py` | Registers the signal receiver via `ready()` |
| `kesaseteli/settings.py` | `ENABLE_AUTH_LOGGING` and `RESILIENT_LOGGER` config |
| `kesaseteli/jobs/quarter_hourly/submit_resilient_log.py` | Scheduled ES shipper job |
| `companies/services.py` | Calls `log_mandate_query` / `log_mandate_query_failure` |
| `applications/services.py` | Calls `log_vtj_query` / `log_vtj_query_failure` |
| `kesaseteli/tests/test_auth_logging.py` | Unit tests for the logging module |
| `companies/tests/test_company_auth_logging.py` | Tests for mandate logging side-effects |
| `applications/tests/test_applications_auth_logging.py` | Tests for VTJ logging side-effects |
