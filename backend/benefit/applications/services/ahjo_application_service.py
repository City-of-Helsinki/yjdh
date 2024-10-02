from django.db.models import QuerySet

from applications.enums import (
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationStatus,
)
from applications.models import Application


class AhjoApplicationsService:
    @staticmethod
    def get_applications_for_request(
        request_type: AhjoRequestType,
    ) -> QuerySet[Application]:
        if request_type == AhjoRequestType.OPEN_CASE:
            applications = Application.objects.get_by_statuses(
                [
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                [AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO],
                True,
            )
        elif request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
            applications = Application.objects.get_for_ahjo_decision()

        elif request_type == AhjoRequestType.ADD_RECORDS:
            applications = Application.objects.with_non_downloaded_attachments()

        elif request_type == AhjoRequestType.UPDATE_APPLICATION:
            applications = Application.objects.get_by_statuses(
                [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
                [AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED],
                False,
            )
        elif request_type == AhjoRequestType.GET_DECISION_DETAILS:
            applications = Application.objects.get_by_statuses(
                [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
                [AhjoStatusEnum.SIGNED_IN_AHJO],
                False,
            )
        elif request_type == AhjoRequestType.DELETE_APPLICATION:
            applications = Application.objects.get_by_statuses(
                [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.CANCELLED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.DRAFT,
                    ApplicationStatus.RECEIVED,
                ],
                AhjoStatusEnum.SCHEDULED_FOR_DELETION,
                False,
            )

        return applications.filter(handled_by_ahjo_automation=True)
