import time

from django.core.management.base import BaseCommand
from django.db.models import Q

from companies.models import Company
from companies.services import update_company_from_ytj


class Command(BaseCommand):
    help = (
        "Update company fields from YTJ API.\n"
        "NOTE: Each lookup might be a paid YTJ API call (depending on the "
        "API environment being used) and is subject to a 0.5 s delay by "
        "default to avoid rate limiting."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--all",
            action="store_true",
            help="Update ALL companies, not just those with missing YTJ data.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help=(
                "Dry run: Print the companies that would be processed, "
                "without calling YTJ API or saving to DB."
            ),
        )
        parser.add_argument(
            "--delay",
            type=float,
            default=0.5,
            help="Delay in seconds between requests to avoid rate limiting.",
        )

    def handle(self, *args, **options):
        all_flag = options["all"]
        dry_run = options["dry_run"]
        delay = options["delay"]

        self.stdout.write(
            self.style.WARNING(
                "WARNING: This command queries the live PRH/YTJ API, "
                "which might incur costs depending on the API environment being used, "
                f"and is subject to rate limiting.\n"
                f"A delay of {delay} seconds is added between queries "
                "to avoid rate limiting."
            )
        )

        if all_flag:
            companies_qs = Company.objects.all()
        else:
            # Missing data = ytj_json is null, empty dict, empty string,
            # or company_form is blank
            companies_qs = Company.objects.filter(
                Q(ytj_json__isnull=True)
                | Q(ytj_json={})
                | Q(ytj_json="")
                | Q(company_form="")
            )

        total_count = companies_qs.count()
        self.stdout.write(f"Found {total_count} companies to process.")

        if dry_run:
            self.stdout.write(
                "Running in DRY-RUN mode. "
                "No API calls or database updates will be made."
            )
            for i, company in enumerate(companies_qs.iterator(chunk_size=100), 1):
                self.stdout.write(
                    f"[{i}/{total_count}] Dry run: Would query YTJ and "
                    f"update company: {company.name} ({company.business_id})"
                )
            self.stdout.write(self.style.SUCCESS("Dry run completed successfully."))
            return

        success_count = 0
        failure_count = 0

        # Use iterator to prevent caching all instances in memory
        for i, company in enumerate(companies_qs.iterator(chunk_size=100), 1):
            self.stdout.write(
                f"[{i}/{total_count}] Processing "
                f"{company.business_id} ({company.name})..."
            )

            # Record state to see if anything changed
            old_ytj_json = company.ytj_json

            # Fetch from YTJ
            try:
                updated_company = update_company_from_ytj(company, raise_exception=True)

                # Check if we got ytj_json back successfully
                if (
                    updated_company.ytj_json
                    and updated_company.ytj_json != old_ytj_json
                ):
                    success_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Successfully updated {company.business_id}"
                        )
                    )
                else:
                    # No change, or already had it
                    success_count += 1
                    self.stdout.write(f"No changes for {company.business_id}")
            except Exception:
                failure_count += 1
                self.stdout.write(
                    self.style.ERROR(f"Failed to update {company.business_id}")
                )

            # Rate limiting delay
            time.sleep(delay)

        self.stdout.write(
            self.style.SUCCESS(
                f"Completed. Success: {success_count}, Failed/Skipped: {failure_count}"
            )
        )
