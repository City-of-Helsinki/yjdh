from django.core.management.base import BaseCommand

from applications.services import EmailTemplateService


class Command(BaseCommand):
    help = (
        "Ensure that all required EmailTemplate database entries exist "
        "by loading them from files."
    )

    def handle(self, *args, **options):
        self.stdout.write("Checking email templates...")
        count = EmailTemplateService.ensure_templates_exist()
        if count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created/updated {count} missing templates."
                )
            )
        else:
            self.stdout.write("All templates already exist.")
