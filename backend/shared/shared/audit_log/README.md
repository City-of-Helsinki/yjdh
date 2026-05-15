<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [YJDH Audit Logging](#yjdh-audit-logging)
  - [Legacy Documentation (For components still in use by Benefit)](#legacy-documentation-for-components-still-in-use-by-benefit)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## YJDH Audit Logging

> **DEPRECATION WARNING:** This package is deprecated and is pending complete removal.
>
> **Current Status:**
> - The old audit log database models (`AuditLogEntry`) and Elasticsearch log transfer tasks have been removed, as they are no longer needed by any backend project.
> - **Kesäseteli** has migrated to using `django-auditlog`.
> - **Benefit** is using a custom audit logging implementation but currently still relies on some components of this package, such as the `AuditLoggingModelViewSet` and the `log` utility.
>
> The ultimate goal is to remove this `shared.audit_log` package entirely. This will happen once Benefit fully migrates away from its dependencies on it. The schedule for Benefit's migration is currently undetermined.

### Legacy Documentation (For components still in use by Benefit)

An audit logging package that can be used with `djangorestframework`.

This audit logger allows you to log messages from Django Rest Framework CRUD events. The serializer works by defining a DRF model viewset that inherits `AuditLoggingModelViewSet`.

To start using this package, follow these steps:

1. Add `djangorestframework` to requirements and add this setting:
    ```
    env = environ.Env(
        ...,
        AUDIT_LOG_ORIGIN=(str, ""),
    )

    # Audit logging
    AUDIT_LOG_ORIGIN = env.str("AUDIT_LOG_ORIGIN")

    INSTALLED_APPS = [
        ...,
        "shared.audit_log",
    ]
    ```

2. Add `AUDIT_LOG_ORIGIN` to env variables.

3. Create a DRF viewset that inherits `shared.audit_log.viewsets.AuditLoggingModelViewSet`. It will log all the CRUD events of that viewset.

Manual logging can also be done using the log function `shared.audit_log.audit_logging.log`:

```
from django.contrib.auth import get_user_model

from applications.models import EmployerApplication
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation

User = get_user_model()

application = EmployerApplication.objects.last()
user = User.objects.last()

send_application(application)

audit_logging.log(
    user,
    "",  # Optional user backend
    Operation.UPDATE,
    application,
    additional_information="application was sent!",  # NOTE: If additional information is provided, the log function assumes that there were no changes to the object iteself but it was (re-)sent to another system for example. Thus it will not log the "changes" of the object.
)
```

Based on:
- [apartment-application-service audit logging](https://github.com/City-of-Helsinki/apartment-application-service/tree/main/audit_log)
- [Helisnki Profile logging format](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/416972828/Helsinki+profile+audit+logging#Profile-audit-log---CRUD-events---JSON-content-and-format)
- [YJDH Audit logging specification](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/7494172830/Audit+logging+specification)
