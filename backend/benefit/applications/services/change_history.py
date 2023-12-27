from applications.models import Application, ApplicationLogEntry, Employee
from shared.audit_log.models import AuditLogEntry


def get_history_for_application(application_id: str) -> list[str]:
    """
    Get change history for application from audit log between the last time status
    was changed from handling to additional_information_needed and back to handling.

    As the audit log doesn't contain changes to related models, this is pretty useless.
    Maybe this can be used later when the audit log is fixed.
    """

    application_log_entry = ApplicationLogEntry.objects.filter(
        application_id=application_id
    )
    ts_start = (
        application_log_entry.filter(from_status="handling")
        .filter(to_status="additional_information_needed")
        .last()
        .created_at
    )
    ts_end = (
        application_log_entry.filter(from_status="additional_information_needed")
        .filter(to_status="handling")
        .last()
        .created_at
    )
    changes = []
    for log_entry in (
        AuditLogEntry.objects.filter(message__audit_event__operation="UPDATE")
        .filter(message__audit_event__target__id=str(application_id))
        .filter(message__audit_event__target__changes__isnull=False)
        .filter(created_at__range=[ts_start, ts_end])
    ):
        changes += log_entry.message["audit_event"]["target"]["changes"]
    return changes


def get_history_for_application_2(application_id: str):
    """
    Solution based on history objects, not audit log.
    """
    application = Application.objects.get(id=application_id)
    employee = Employee.objects.get(application=application)
    application_log_entry = ApplicationLogEntry.objects.filter(
        application_id=application_id
    )

    ts_start = (
        application_log_entry.filter(from_status="handling")
        .filter(to_status="additional_information_needed")
        .last()
        .created_at
    )
    ts_end = (
        application_log_entry.filter(from_status="additional_information_needed")
        .filter(to_status="handling")
        .last()
        .created_at
    )

    hist_application_when_start_editing = application.history.as_of(ts_start)._history
    hist_application_when_stop_editing = application.history.as_of(ts_end)._history
    hist_employee_when_start_editing = employee.history.as_of(ts_start)._history
    hist_employee_when_stop_editing = employee.history.as_of(ts_end)._history

    application_delta = hist_application_when_stop_editing.diff_against(
        hist_application_when_start_editing,
        excluded_fields=("application_step", "status"),
    )
    employee_delta = hist_employee_when_stop_editing.diff_against(
        hist_employee_when_start_editing,
        excluded_fields=("encrypted_first_name", "encrypted_last_name"),
    )
    changes = [
        {"field": change.field, "old": change.old, "new": change.new}
        for change in application_delta.changes
    ]
    changes += [
        {"field": f"employee.{change.field}", "old": change.old, "new": change.new}
        for change in employee_delta.changes
    ]
    return changes
