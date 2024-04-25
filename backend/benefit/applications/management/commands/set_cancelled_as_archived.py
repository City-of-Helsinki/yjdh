from django.core.management.base import BaseCommand

from applications.enums import ApplicationStatus
from applications.models import Application


class Command(BaseCommand):
    help = "Set cancelled applications as archived"

    def handle(self, *args, **options):
        applications = Application.objects.filter(status=ApplicationStatus.CANCELLED)
        total_changed = 0
        for application in applications:
            if application.archived is False:
                total_changed += 1
                application.archived = True
                application.save()
        self.stdout.write(f"Set {total_changed} applications as archived")
