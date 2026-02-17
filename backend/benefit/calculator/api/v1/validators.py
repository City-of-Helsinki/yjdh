from applications.api.v1.status_transition_validator import StatusTransitionValidator
from calculator.enums import InstalmentStatus


class InstalmentStatusValidator(StatusTransitionValidator):
    initial_status = InstalmentStatus.WAITING

    STATUS_TRANSITIONS = {
        InstalmentStatus.WAITING: (
            InstalmentStatus.ACCEPTED,
            InstalmentStatus.CANCELLED,
            InstalmentStatus.REQUESTED,
            InstalmentStatus.RESPONDED,
            InstalmentStatus.PENDING,
        ),
        InstalmentStatus.ACCEPTED: (
            InstalmentStatus.WAITING,
            InstalmentStatus.PAID,
        ),
        InstalmentStatus.ERROR_IN_TALPA: (
            InstalmentStatus.WAITING,
            InstalmentStatus.ACCEPTED,
            InstalmentStatus.PAID,
        ),
        InstalmentStatus.PAID: (InstalmentStatus.COMPLETED,),
        InstalmentStatus.CANCELLED: (
            InstalmentStatus.WAITING,
            InstalmentStatus.COMPLETED,
        ),
        InstalmentStatus.COMPLETED: (),
        InstalmentStatus.REQUESTED: (
            InstalmentStatus.RESPONDED,
            InstalmentStatus.CANCELLED,
        ),
        InstalmentStatus.RESPONDED: (
            InstalmentStatus.ACCEPTED,
            InstalmentStatus.CANCELLED,
            InstalmentStatus.PENDING,
        ),
        InstalmentStatus.PENDING: (
            InstalmentStatus.CANCELLED,
            InstalmentStatus.ACCEPTED,
        ),
    }
