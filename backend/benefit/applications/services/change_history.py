from datetime import datetime, timedelta

from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from simple_history.models import ModelChange

from applications.enums import ApplicationStatus
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
EXCLUDED_APPLICATION_FIELDS = (
    "application_step",
    "status",
    "pay_subsidy_percent",
)

EXCLUDED_EMPLOYEE_FIELDS = (
    "encrypted_first_name",
    "encrypted_last_name",
    "encrypted_social_security_number",
)


def _get_handlers(as_ids: bool = False) -> list:
    return [
        (user.id if as_ids else user)
        for user in User.objects.filter(Q(is_staff=True) | Q(is_superuser=True))
    ]


def _parse_change_values(value, field):
    if value is None:
        return None
    if isinstance(value, bool):
        return bool(value)
    if field == "handler":
        return User.objects.get(id=value).get_full_name() or "Unknown user"

    return str(value)


def _format_change_dict(change: ModelChange, relation_name: str = None) -> dict:
    def _get_field_name(relation_name):
        if relation_name:
            return f"{relation_name}.{change.field}"
        return f"{change.field}"

    return {
        "field": _get_field_name(relation_name),
        "old": _parse_change_values(change.old, change.field),
        "new": _parse_change_values(change.new, change.field),
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
    except Application.DoesNotExist:
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

    changes = []

    changes += [
        _format_change_dict(
            change,
        )
        for change in application_delta.changes
    ]

    changes += [
        _format_change_dict(change, relation_name="employee")
        for change in employee_delta.changes
    ]
    if new_or_edited_attachments:
        for attachment in new_or_edited_attachments:
            changes.append(
                {
                    "field": "attachments",
                    "old": None,
                    "new": f"{attachment.attachment_file.name} ({_(attachment.attachment_type)})",
                }
            )

    if not DISABLE_DE_MINIMIS_AIDS and new_or_edited_de_minimis_aids:
        changes.append({"field": "de_minimis_aid_set", "old": None, "new": None})

    if not changes:
        return []

    new_record = application_delta.new_record
    return [
        {
            "date": new_record.history_date,
            "user": (
                f"{new_record.history_user.first_name} {new_record.history_user.last_name}"
                if new_record.history_user
                and new_record.history_user.first_name
                and new_record.history_user.last_name
                else "Unknown user"
            ),
            "reason": "",
            "changes": changes,
        }
    ]


def get_application_change_history_made_by_applicant(application: Application) -> list:
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


def _is_history_change_excluded(change, excluded_fields):
    return change.field in excluded_fields or change.old == change.new


def _get_change_set_base(new_record: ModelChange):
    return {
        "date": new_record.history_date,
        "reason": new_record.history_change_reason,
        "user": (
            f"{new_record.history_user.first_name} {new_record.history_user.last_name[0]}."
            if new_record.history_user
            and new_record.history_user.first_name
            and new_record.history_user.last_name
            else "Unknown user"
        ),
        "changes": [],
    }


look_up_for_application_save_in_seconds = 0.25


def _filter_and_format_changes(
    changes, excluded_fields, relation_name: str = None, delta_time=None
):
    return list(
        map(
            lambda change: _format_change_dict(change, relation_name),
            filter(  # Only accept those changes that are within the threshold delta_time and/or not excluded field
                lambda change: not _is_history_change_excluded(change, excluded_fields)
                and (
                    delta_time
                    is None  # We'll ignore this check for application changes as delta_time's not present
                    or 0 <= delta_time <= look_up_for_application_save_in_seconds
                ),
                changes,
            ),
        )
    )


def _create_change_set(app_diff, employee_diffs):
    change_set = _get_change_set_base(app_diff.new_record)
    change_set["changes"] = _filter_and_format_changes(
        app_diff.changes,
        EXCLUDED_APPLICATION_FIELDS,
    )

    for employee_diff in employee_diffs:
        delta_time = (
            employee_diff.new_record.history_date - app_diff.new_record.history_date
        ).total_seconds()
        change_set["changes"] += _filter_and_format_changes(
            employee_diff.changes, EXCLUDED_EMPLOYEE_FIELDS, "employee", delta_time
        )

    return (
        change_set
        if len(change_set["changes"]) > 0
        or (change_set["reason"] and len(change_set["reason"]) > 0)
        else None
    )


def get_application_change_history_made_by_handler(application: Application) -> list:
    """
    Get application change history between the point when application is received and
    the current time. If the application has been in status
    additional_information_needed, changes made then are not included.
    This solution should work for getting changes made by handler.

    NOTE: The same de minimis aid restriction here, so they are not tracked.
    Also, changes made when application status is additional_information_needed are
    not tracked, even if they are made by handler.
    """

    # Get all edits made by staff users and the first edit which is queried as RECEIVED for some reason
    staff_users = User.objects.all().filter(is_staff=True).values_list("id", flat=True)
    application_history = (
        application.history.filter(
            history_user_id__in=list(staff_users),
            status__in=[
                ApplicationStatus.HANDLING,
            ],
        )
        | application.history.filter(status=ApplicationStatus.RECEIVED)[:1]
    )

    application_diffs = []

    for i in range(0, len(application_history) - 1):
        diff = application_history[i].diff_against(application_history[i + 1])
        application_diffs.append(diff)

    app_diff_dates = [diff.new_record.history_date for diff in application_diffs]

    # fetch employee history changes that occured during the saving of application
    employee_q_objects = Q()
    for dt in app_diff_dates:
        start_date = dt - timedelta(seconds=look_up_for_application_save_in_seconds)
        end_date = dt + timedelta(seconds=look_up_for_application_save_in_seconds)
        employee_q_objects |= Q(history_date__range=(start_date, end_date))

    employee_history = application.employee.history.filter(employee_q_objects)
    employee_diffs = []
    for i in range(0, len(employee_history) - 1):
        diff = employee_history[i].diff_against(employee_history[i + 1])
        employee_diffs.append(diff)

    change_sets = list(
        filter(
            None,
            map(
                lambda app_diff: _create_change_set(app_diff, employee_diffs),
                application_diffs,
            ),
        )
    )

    return change_sets


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
