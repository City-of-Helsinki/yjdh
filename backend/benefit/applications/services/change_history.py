from datetime import timedelta

from django.db.models import Q
from simple_history.models import ModelChange

from applications.enums import ApplicationStatus
from applications.models import Application, ApplicationLogEntry
from users.models import User

DISABLE_DE_MINIMIS_AIDS = True
EXCLUDED_APPLICATION_FIELDS = (
    "application_step",
    "pay_subsidy_percent",
)

EXCLUDED_EMPLOYEE_FIELDS = (
    "encrypted_first_name",
    "encrypted_last_name",
    "encrypted_social_security_number",
)


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


def _is_history_change_excluded(change, excluded_fields):
    return change.field in excluded_fields or change.old == change.new


def _get_change_set_base(new_record: ModelChange):
    return {
        "date": new_record.history_date,
        "reason": new_record.history_change_reason,
        "user": {
            "staff": getattr(new_record.history_user, "is_staff", False),
            "name": (
                f"{new_record.history_user.first_name} {new_record.history_user.last_name[0]}."
                if new_record.history_user
                and new_record.history_user.first_name
                and new_record.history_user.last_name
                else "Unknown user"
            ),
        },
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


def get_application_change_history(application: Application) -> list:
    """
    Get application change history between the point when application is received and
    the current time.

    NOTE: The de minimis aid is not tracked here.
    """

    # Exclude any non-human users
    users = User.objects.exclude(
        username__icontains="ahjorestapi",
        first_name__exact="",
        last_name__exact="",
    ).values_list("id", flat=True)

    application_history = (
        application.history.filter(
            history_user__id__in=users,
            status__in=[
                ApplicationStatus.HANDLING,
                ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ],
        )
        | application.history.filter(status=ApplicationStatus.RECEIVED)[:1]
    )

    application_diffs = []

    for i in range(len(application_history) - 1):
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
    for i in range(len(employee_history) - 1):
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

    submitted_at = (
        ApplicationLogEntry.objects.filter(
            application=application, to_status=ApplicationStatus.RECEIVED
        )
        .order_by("-created_at")
        .values("created_at")[:1]
    )

    attachment_diffs = []
    for attachment in application.attachments.all():
        for new_record in attachment.history.filter(
            history_type="+",
            history_date__gte=submitted_at,
            history_user_id__in=list(users),
        ):
            change_set_base = _get_change_set_base(new_record)
            change_set_base["changes"] = [
                {
                    "field": "attachments",
                    "old": "+",
                    "new": new_record.attachment_file,
                    "meta": new_record.attachment_type,
                }
            ]
            attachment_diffs.append(change_set_base)
    change_sets = change_sets + attachment_diffs
    change_sets.sort(key=lambda x: x["date"], reverse=True)
    return change_sets
