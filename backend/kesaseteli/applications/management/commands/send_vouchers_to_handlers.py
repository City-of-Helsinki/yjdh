from django.core.management.base import BaseCommand

from applications.enums import YouthApplicationStatus
from applications.models import YouthApplication


class Command(BaseCommand):
    help = "Send accepted youth summer vouchers to handler email"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Dry run, don't really send anything",
        )
        parser.add_argument(
            "--id", type=str, help="UUID of a single youth application to send"
        )

    def handle(self, dry_run, id, *args, **options):
        apps = YouthApplication.objects.filter(status=YouthApplicationStatus.ACCEPTED)
        if id:
            # Only a single voucher is sent
            apps = apps.filter(id=id)

        for app in apps:
            if app.has_youth_summer_voucher:
                if dry_run:
                    ok = True
                else:
                    ok = app.youth_summer_voucher.send_youth_summer_voucher_email(
                        language=app.language, send_to_youth=False, send_to_handler=True
                    )

                if ok:
                    self.stdout.write(self.style.SUCCESS(f"Sent {app.id}"))
                else:
                    self.stdout.write(
                        self.style.ERROR(f"EMAIL ERROR: {app.pk} failed when sending!")
                    )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"VOUCHER ERROR: {app.pk} does not have a youth summer voucher!"
                    )
                )

        self.stdout.write(self.style.SUCCESS(f"Processed {apps.count()} vouchers"))
