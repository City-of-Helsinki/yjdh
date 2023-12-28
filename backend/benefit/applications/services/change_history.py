from datetime import datetime

from django.db.models import Q
from django.utils import timezone
from simple_history.models import ModelChange

from applications.models import (
    Application,
    ApplicationLogEntry,
    Attachment,
    DeMinimisAid,
    Employee,
)
from shared.audit_log.models import AuditLogEntry
from users.models import User

DISABLE_DE_MINIMIS_AIDS = True
EXCLUDED_APPLICATION_FIELDS = ("application_step", "status")
EXCLUDED_EMPLOYEE_FIELDS = ("encrypted_first_name", "encrypted_last_name")


def _get_handlers(as_ids: bool = False) -> list:
    return [
        (user.id if as_ids else user)
        for user in User.objects.filter(Q(is_staff=True) | Q(is_superuser=True))
    ]


def _format_change_dict(change: ModelChange, employee: bool) -> dict:
    return {
        "field": f"{'employee.' if employee else ''}{change.field}",
        "old": str(change.old),
        "new": str(change.new),
    }


def _get_application_change_history_between_timestamps(
    ts_start: datetime, ts_end: datetime, application: Application
) -> list:
    """
    Change history between two timestamps. Related objects handled here
    separately (employee, attachments, de_minimis_aid_set).

    One-to-many related objects are handled in a way if there's new or modified
    objects between the above mentioned status changes, the field in question
    is considered changed. In this case field is added to the changes list and
    old/new values set to None. The fields that are like this are attachments
    and de_minimis_aid_set.
    """
    employee = application.employee
    try:
        hist_application_when_start_editing = application.history.as_of(
            ts_start
        )._history
        hist_application_when_stop_editing = application.history.as_of(ts_end)._history
        hist_employee_when_start_editing = employee.history.as_of(ts_start)._history
        hist_employee_when_stop_editing = employee.history.as_of(ts_end)._history
    except Employee.DoesNotExist:
        return []

    new_or_edited_attachments = Attachment.objects.filter(
        Q(created_at__gte=ts_start) | Q(modified_at=ts_start),
        Q(created_at__lte=ts_end) | Q(modified_at__lte=ts_end),
        application=application,
    )

    new_or_edited_de_minimis_aids = []
    if not DISABLE_DE_MINIMIS_AIDS:
        new_or_edited_de_minimis_aids = DeMinimisAid.objects.filter(
            Q(created_at__gte=ts_start) | Q(modified_at=ts_start),
            Q(created_at__lte=ts_end) | Q(modified_at__lte=ts_end),
            application=application,
        )

    application_delta = hist_application_when_stop_editing.diff_against(
        hist_application_when_start_editing,
        excluded_fields=EXCLUDED_APPLICATION_FIELDS,
    )
    employee_delta = hist_employee_when_stop_editing.diff_against(
        hist_employee_when_start_editing,
        excluded_fields=EXCLUDED_EMPLOYEE_FIELDS,
    )
    changes = [
        _format_change_dict(change, employee=False)
        for change in application_delta.changes
    ]
    changes += [
        _format_change_dict(change, employee=True) for change in employee_delta.changes
    ]
    if new_or_edited_attachments:
        changes.append({"field": "attachments", "old": None, "new": None})

    if not DISABLE_DE_MINIMIS_AIDS and new_or_edited_de_minimis_aids:
        changes.append({"field": "de_minimis_aid_set", "old": None, "new": None})

    return changes


def get_application_change_history_for_handler(application: Application) -> list:
    """
    Get change history for application comparing historic application objects between
    the last time status was changed from handling to additional_information_needed
    and back to handling. This procudes a list of changes that are made by applicant
    when status is additional_information_needed.

    NOTE: As the de minimis aids are always removed and created again when
    updated (BaseApplicationSerializer -> _update_de_minimis_aid()), this
    solution always thinks that de minimis aids are changed.
    That's why tracking de minimis aids are disabled for now.
    """
    application_log_entries = ApplicationLogEntry.objects.filter(
        application=application
    )

    log_entry_start = (
        application_log_entries.filter(from_status="handling")
        .filter(to_status="additional_information_needed")
        .last()
    )
    log_entry_end = (
        application_log_entries.filter(from_status="additional_information_needed")
        .filter(to_status="handling")
        .last()
    )

    if not log_entry_start or not log_entry_end:
        return []

    ts_start = log_entry_start.created_at
    ts_end = log_entry_end.created_at
    return _get_application_change_history_between_timestamps(
        ts_start, ts_end, application
    )


def get_application_change_history_for_applicant(application: Application) -> list:
    """
    Get application change history between the point when application is received and
    the current time. If the application has been in status
    additional_information_needed, changes made then are not included.
    This solution should work for getting changes made by handler.

    NOTE: The same de minimis aid restriction here, so they are not tracked.
    Also, changes made when application status is additional_information_needed are
    not tracked, even if they are made by handler.
    """
    application_log_entries = ApplicationLogEntry.objects.filter(
        application=application
    )

    log_entry_start = (
        application_log_entries.filter(from_status="draft")
        .filter(to_status="received")
        .last()
    )

    if not log_entry_start:
        return []

    log_entry_end = (
        application_log_entries.filter(from_status="handling")
        .filter(to_status="additional_information_needed")
        .last()
    )

    ts_start = log_entry_start.created_at
    if not log_entry_end:
        ts_end = timezone.now()
        return _get_application_change_history_between_timestamps(
            ts_start, ts_end, application
        )

    ts_end = log_entry_end.created_at

    changes_before_additional_info = _get_application_change_history_between_timestamps(
        ts_start, ts_end, application
    )

    log_entry_start_additional = (
        application_log_entries.filter(from_status="additional_information_needed")
        .filter(to_status="handling")
        .last()
    )
    if not log_entry_start_additional:
        return changes_before_additional_info

    ts_start_additional = log_entry_start_additional.created_at
    ts_end_additional = timezone.now()
    changes_after_additional_info = _get_application_change_history_between_timestamps(
        ts_start_additional, ts_end_additional, application
    )
    return changes_before_additional_info + changes_after_additional_info


def get_application_change_history_for_applicant_from_audit_log(
    application: Application,
) -> list:
    """
    Get all changes to application that is made by handlers. Audit log based solution.
    As the audit log doesn't contain changes to related models, this is mostly useless.
    Maybe this can be used later when the audit log is fixed. Remove if you want.
    """
    handler_user_ids = _get_handlers(as_ids=True)
    changes = []
    for log_entry in (
        AuditLogEntry.objects.filter(message__audit_event__operation="UPDATE")
        .filter(message__audit_event__target__id=str(application.id))
        .filter(message__audit_event__target__changes__isnull=False)
        .filter(message__audit_event__actor__user_id__in=handler_user_ids)
    ):
        changes += log_entry.message["audit_event"]["target"]["changes"]
    return changes
