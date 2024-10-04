from django.db.models import QuerySet

from applications.enums import (
    AhjoRequestType,
    AhjoStatus as AhjoStatusEnum,
    ApplicationStatus,
)
from applications.models import Application


class AhjoQueryParameters:
    """This class resolves the query parameters which are used to query applications
    based on the request type."""

    @staticmethod
    def resolve(request_type: AhjoRequestType) -> dict:
        ahjo_application_query_parameters = {
            AhjoRequestType.OPEN_CASE: {
                "application_statuses": [
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO],
                "has_no_case_id": True,
            },
            AhjoRequestType.SEND_DECISION_PROPOSAL: {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [
                    AhjoStatusEnum.CASE_OPENED,
                    AhjoStatusEnum.NEW_RECORDS_RECEIVED,
                ],
                "has_no_case_id": False,
            },
            AhjoRequestType.UPDATE_APPLICATION: {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [
                    AhjoStatusEnum.DECISION_PROPOSAL_ACCEPTED,
                    AhjoStatusEnum.NEW_RECORDS_RECEIVED,
                ],
                "has_no_case_id": False,
            },
            AhjoRequestType.DELETE_APPLICATION: {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.CANCELLED,
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.HANDLING,
                    ApplicationStatus.DRAFT,
                    ApplicationStatus.RECEIVED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SCHEDULED_FOR_DELETION],
                "has_no_case_id": False,
            },
            AhjoRequestType.GET_DECISION_DETAILS: {
                "application_statuses": [
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.REJECTED,
                ],
                "ahjo_statuses": [AhjoStatusEnum.SIGNED_IN_AHJO],
                "has_no_case_id": False,
            },
        }
        return ahjo_application_query_parameters.get(request_type)


class AhjoApplicationsService:
    @staticmethod
    def get_applications_for_request(
        request_type: AhjoRequestType,
    ) -> QuerySet[Application]:
        if request_type in [
            AhjoRequestType.OPEN_CASE,
            AhjoRequestType.UPDATE_APPLICATION,
            AhjoRequestType.DELETE_APPLICATION,
            AhjoRequestType.GET_DECISION_DETAILS,
        ]:
            parameters = AhjoQueryParameters.resolve(request_type)
            applications = Application.objects.get_by_statuses(**parameters)

        elif request_type == AhjoRequestType.SEND_DECISION_PROPOSAL:
            parameters = AhjoQueryParameters.resolve(request_type)
            applications = Application.objects.get_for_ahjo_decision(**parameters)

        elif request_type == AhjoRequestType.ADD_RECORDS:
            applications = Application.objects.with_non_downloaded_attachments()

        return applications.filter(handled_by_ahjo_automation=True)
