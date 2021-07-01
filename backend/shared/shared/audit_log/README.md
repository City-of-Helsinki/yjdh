## YJDH Audit Logging

An audit logging package that can be used with `djangorestframework`.

This audit logger allows you to save log messages from Django Rest Famework CRUD events. The serializer works by defining a DRF model viewset that inherits `AuditLoggingModelViewSet`.

To start using this package, follow these steps:

1. Add `djangorestframework` to requirements and add these settings:
    ```
    # Audit logging
    AUDIT_LOG_ORIGIN = env.str("AUDIT_LOG_ORIGIN")
    AUDIT_LOG_FILENAME = env.str("AUDIT_LOG_FILENAME")

    if AUDIT_LOG_FILENAME:
        if "X" in AUDIT_LOG_FILENAME:
            import random
            import re
            import string
    
            system_random = random.SystemRandom()
            char_pool = string.ascii_lowercase + string.digits
            AUDIT_LOG_FILENAME = re.sub(
                "X", lambda x: system_random.choice(char_pool), AUDIT_LOG_FILENAME
            )
        _audit_log_handler = {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": AUDIT_LOG_FILENAME,
            "maxBytes": 100_000_000,
            "backupCount": 1,
            "delay": True,
        }
    else:
        _audit_log_handler = {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    
    
    LOGGING = {
        ...
        "formatters": {
            "verbose": {
                "format": "%(asctime)s p%(process)d %(name)s %(levelname)s: %(message)s",
            }
        },
        "handlers": {
            ...
            "audit": _audit_log_handler,
        },
        "loggers": {
            ...
            "audit": {
                "level": "INFO",  # Audit log only writes at INFO level
                "handlers": [
                    "audit",
                ],
            },
        },
    }
    ```

2. Add `AUDIT_LOG_ORIGIN` and `AUDIT_LOG_FILENAME` to env variables


3. Create a DRF viewset that inherits `shared.audit_log.viewsets.AuditLoggingModelViewSet`. It will log all the CRUD events of that viewset.


Based on:
- [apartment-application-service audit logging](https://github.com/City-of-Helsinki/apartment-application-service/tree/develop/audit_log)
- [Helisnki Profile logging format](https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/416972828/Helsinki+profile+audit+logging#Profile-audit-log---CRUD-events---JSON-content-and-format)
