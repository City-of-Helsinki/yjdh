from django.core.management.base import BaseCommand

from applications.models import AhjoDecisionProposalDraft, Application


class Command(BaseCommand):
    help = "Create decision proposal drafts for older than 2024-04-16 applications"

    def handle(self, *args, **options):
        applications = Application.objects.all()
        total_created = 0
        for application in applications:
            try:
                application.decision_proposal_draft  # noqa
            except:  # noqa
                AhjoDecisionProposalDraft.objects.create(
                    application=application,
                )
                total_created += 1
        self.stdout.write(f"Created {total_created} decision proposal drafts")
