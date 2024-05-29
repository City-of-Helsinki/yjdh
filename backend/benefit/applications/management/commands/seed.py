from datetime import datetime, timedelta

import faker
import pytz
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.enums import (
    AhjoStatus as AhjoStatusEnum,
    ApplicationBatchStatus,
    ApplicationOrigin,
    ApplicationStatus,
    BenefitType,
    DecisionType,
)
from applications.models import (
    AhjoDecisionText,
    AhjoStatus,
    Application,
    ApplicationBasis,
    ApplicationBatch,
)
from applications.services.ahjo_decision_service import (
    create_decision_text_for_application,
)
from applications.tests.factories import (
    AcceptedDecisionProposalFactory,
    AdditionalInformationNeededApplicationFactory,
    ApplicationBatchFactory,
    ApplicationWithAttachmentFactory,
    CancelledApplicationFactory,
    DecidedApplicationFactory,
    DeniedDecisionProposalFactory,
    HandlingApplicationFactory,
    ReceivedApplicationFactory,
    RejectedApplicationFactory,
)
from messages.models import Message, MessageType
from terms.models import Terms
from users.models import User


class Command(BaseCommand):
    help = "Seed the database with applications"

    def add_arguments(self, parser):
        parser.add_argument(
            "--number",
            type=int,
            default=5,
            help="Number of applications to create",
        )

    def handle(self, *args, **options):
        batch_count = 6
        statuses = ApplicationStatus.values
        filtered_statuses = [
            status for status in statuses if status != "rejected_by_talpa"
        ]
        total_created = ((len(filtered_statuses) * 2) + batch_count) * options["number"]
        if not settings.DEBUG:
            self.stdout.write(
                "Seeding is allowed only when the DEBUG variable set to True"
            )
            return
        run_seed(options["number"])
        self.stdout.write(f"Created {total_created} applications")


def clear_applications():
    """Clear all seeded applications and application basis records and terms,
    which are not deleted with on_delete=CASCADE and delete the media folder"""
    applications = Application.objects.all()
    for application in applications:
        for attachment in application.attachments.all():
            attachment.attachment_file.delete()
    applications.delete()

    ApplicationBatch.objects.all().delete()

    ApplicationBasis.objects.all().delete()
    AhjoStatus.objects.all().delete()
    Terms.objects.all().delete()
    User.objects.filter(last_login=None).exclude(username="admin").delete()
    AhjoDecisionText.objects.all().delete()


def run_seed(number):
    """Delete all existing applications and create applications for all statuses,
    with cancelled applications being modified 30 days ago and drafts being modified 180 and 166 days ago
    """

    def _create_batch(
        status: ApplicationBatchStatus, proposal_for_decision: ApplicationStatus
    ):
        batch = ApplicationBatchFactory(
            status=status, proposal_for_decision=proposal_for_decision
        )

        # Need to delete a few applications that are made for the batch for testing purposes
        Application.objects.filter(batch=batch).delete()

        apps = []
        for _ in range(number):
            if proposal_for_decision == ApplicationStatus.ACCEPTED:
                app = DecidedApplicationFactory()
                create_decision_text_for_application(app)
                apps.append(app)
                AhjoStatus.objects.create(
                    status=AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
                    application=app,
                )

            elif proposal_for_decision == ApplicationStatus.REJECTED:
                app = RejectedApplicationFactory()
                create_decision_text_for_application(
                    app, decision_type=DecisionType.DENIED
                )
                apps.append(app)
        batch.applications.set(apps)
        batch.handler = User.objects.filter(is_staff=True).last()
        batch.save()

    f = faker.Faker()

    clear_applications()

    factories = (
        AdditionalInformationNeededApplicationFactory,
        ApplicationWithAttachmentFactory,
        CancelledApplicationFactory,
        DecidedApplicationFactory,
        HandlingApplicationFactory,
        ReceivedApplicationFactory,
        RejectedApplicationFactory,
    )

    for factory in factories:
        for _ in range(number):
            for application_origin in ApplicationOrigin.values:
                random_datetime = f.past_datetime(tzinfo=pytz.UTC)
                application = factory(application_origin=application_origin)
                application.created_at = random_datetime
                application.benefit_type = BenefitType.SALARY_BENEFIT

                if factory == HandlingApplicationFactory:
                    user = User.objects.filter(is_staff=False).first()
                    staff_user = User.objects.filter(is_staff=True).first()
                    Message.objects.create(
                        content="Apua, en osaa täyttää hakemusta!",
                        application=application,
                        message_type=MessageType.APPLICANT_MESSAGE,
                        sender=user,
                        seen_by_applicant=True,
                    )
                    Message.objects.create(
                        content="Ei hätää, autan sinua.",
                        application=application,
                        message_type=MessageType.HANDLER_MESSAGE,
                        sender=staff_user,
                    )
                    AhjoStatus.objects.create(
                        status=AhjoStatusEnum.SUBMITTED_BUT_NOT_SENT_TO_AHJO,
                        application=application,
                    )

                application.save()

                application.log_entries.all().update(created_at=random_datetime)

    _create_batch(ApplicationBatchStatus.DRAFT, ApplicationStatus.ACCEPTED)
    _create_batch(ApplicationBatchStatus.DRAFT, ApplicationStatus.REJECTED)

    _create_batch(
        ApplicationBatchStatus.AWAITING_AHJO_DECISION, ApplicationStatus.ACCEPTED
    )
    _create_batch(
        ApplicationBatchStatus.AWAITING_AHJO_DECISION, ApplicationStatus.REJECTED
    )

    _create_batch(ApplicationBatchStatus.DECIDED_ACCEPTED, ApplicationStatus.ACCEPTED)
    _create_batch(ApplicationBatchStatus.DECIDED_REJECTED, ApplicationStatus.REJECTED)
    cancelled_deletion_threshold = _past_datetime(30)
    draft_deletion_threshold = _past_datetime(180)
    draft_notify_threshold = _past_datetime(180 - 14)

    cancelled_applications = Application.objects.filter(
        status=ApplicationStatus.CANCELLED
    )
    cancelled_applications.update(modified_at=cancelled_deletion_threshold)

    ids = Application.objects.filter(status=ApplicationStatus.DRAFT).values_list(
        "pk", flat=True
    )[0:5]
    # Update the first 5 drafts to be deleted, then the rest to be notified
    Application.objects.filter(pk__in=ids).update(modified_at=draft_deletion_threshold)
    Application.objects.exclude(pk__in=ids).update(modified_at=draft_notify_threshold)

    _create_templates()


def _past_datetime(days: int) -> datetime:
    return timezone.now() - timedelta(days=days)


def _create_templates():
    AcceptedDecisionProposalFactory(),
    DeniedDecisionProposalFactory(),
