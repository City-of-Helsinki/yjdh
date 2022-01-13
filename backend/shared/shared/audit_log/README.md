## YJDH Audit Logging

An audit logging package that can be used with `djangorestframework`.

This audit logger allows you to save log messages from Django Rest Famework CRUD events to database. The serializer works by defining a DRF model viewset that inherits `AuditLoggingModelViewSet`.

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
- [apartment-application-service audit logging](https://github.com/City-of-Helsinki/apartment-application-service/tree/develop/audit_log)
- [Helisnki Profile logging format](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/416972828/Helsinki+profile+audit+logging#Profile-audit-log---CRUD-events---JSON-content-and-format)
- [YJDH Audit logging specification](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/7494172830/Audit+logging+specification)
