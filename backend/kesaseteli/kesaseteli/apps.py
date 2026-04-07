from django.apps import AppConfig


class KesaseteliProjectConfig(AppConfig):
    name = "kesaseteli"

    def ready(self):
        from auditlog_extra.utils import AuditLogConfigurationHelper

        AuditLogConfigurationHelper.raise_error_if_unconfigured_models()
