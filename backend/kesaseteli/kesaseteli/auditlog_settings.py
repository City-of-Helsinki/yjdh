# ADD any AUDIT LOGGING SETTINGS you want to use in your project HERE.
# Only the settings listed in __all__ will be imported
# in kesaseteli/settings.py:
__all__ = [
    "AUDITLOG_INCLUDE_ALL_MODELS",
    "AUDITLOG_DISABLE_REMOTE_ADDR",
    "AUDITLOG_DISABLE_ON_RAW_SAVE",
    "AUDITLOG_EXCLUDE_TRACKING_MODELS",
    "AUDITLOG_INCLUDE_TRACKING_MODELS",
]

# Register all models by default
AUDITLOG_INCLUDE_ALL_MODELS = True

# Exclude the IP address from logging?
# When using AuditlogMiddleware, the IP address is logged by default
AUDITLOG_DISABLE_REMOTE_ADDR = False

# Disables logging during raw save. (I.e. for instance using loaddata)
# M2M operations will still be logged, since they’re never considered raw.
AUDITLOG_DISABLE_ON_RAW_SAVE = True

# Exclude models in registration process.
# This setting will only be considered when AUDITLOG_INCLUDE_ALL_MODELS is True.
AUDITLOG_EXCLUDE_TRACKING_MODELS = (
    "auditlog.logentry",  # excluded by default, here to show it exists
    "admin.logentry",  # excluded by default, here to show it exists
    "applications.historicalemployerapplication",  # to be removed completely
    "applications.historicalemployersummervoucher",  # to be removed completely
    "applications.historicalyouthsummervoucher",  # to be removed completely
    "audit_log.auditlogentry",  # no double audit logging
    "contenttypes.contenttype",  # system model
    "sequences.sequence",  # system model
    "sessions.session",  # auth model
)

AUDITLOG_INCLUDE_TRACKING_MODELS = (
    "applications.attachment",
    "applications.emailtemplate",
    "applications.employerapplication",
    "applications.employersummervoucher",
    "applications.school",
    "applications.summervoucherconfiguration",
    "applications.youthapplication",
    "applications.youthsummervoucher",
    "auth.group",
    "auth.group_permissions",
    "auth.permission",
    {
        "model": "auth.user",
        "exclude_fields": ["last_login"],  # To reduce excessive logging
    },
    "auth.user_groups",
    "auth.user_user_permissions",
    "companies.company",
)
