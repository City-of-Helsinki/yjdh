from datetime import date

from django.conf import settings
from django.core.management.base import BaseCommand

from applications.models import SummerVoucherConfiguration
from applications.target_groups import get_target_group_choices

AVAILABLE_TARGET_GROUPS = [choice[0] for choice in get_target_group_choices()]


class Command(BaseCommand):
    help = "Create Summer Voucher Configuration for the specified year."

    def add_arguments(self, parser):
        parser.add_argument(
            "--year",
            type=int,
            default=date.today().year,
            help="Year for the configuration (default: current year)",
        )
        parser.add_argument(
            "--voucher-value",
            type=int,
            default=settings.SUMMER_VOUCHER_DEFAULT_VOUCHER_VALUE,
            help=(
                "Voucher value in euros (default: "
                f"{settings.SUMMER_VOUCHER_DEFAULT_VOUCHER_VALUE})"
            ),
        )
        parser.add_argument(
            "--min-work-compensation",
            type=int,
            default=settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_COMPENSATION,
            help=(
                "Minimum work compensation in euros (default: "
                f"{settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_COMPENSATION})"
            ),
        )
        parser.add_argument(
            "--min-work-hours",
            type=int,
            default=settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_HOURS,
            help=(
                "Minimum work hours (default: "
                f"{settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_HOURS})"
            ),
        )
        parser.add_argument(
            "--target-groups",
            nargs="+",
            default=None,
            help=(
                "List of target group identifiers. The options are: "
                f"{', '.join(AVAILABLE_TARGET_GROUPS)} (default: all)"
                "(default: all)"
            ),
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force creation by overwriting existing configuration if it exists",
        )

    def handle(self, *args, **options):
        year = options["year"]
        force = options["force"]

        target_groups = options["target_groups"]
        if target_groups is None:
            target_groups = AVAILABLE_TARGET_GROUPS

        voucher_value = options["voucher_value"]
        min_work_compensation = options["min_work_compensation"]
        min_work_hours = options["min_work_hours"]

        if SummerVoucherConfiguration.objects.filter(year=year).exists() and not force:
            self.stdout.write(
                self.style.WARNING(
                    f"SummerVoucherConfiguration for year {year} already exists. "
                    "Use --force to overwrite."
                )
            )
            return

        SummerVoucherConfiguration.objects.update_or_create(
            year=year,
            defaults={
                "target_group": target_groups,
                "voucher_value_in_euros": voucher_value,
                "min_work_compensation_in_euros": min_work_compensation,
                "min_work_hours": min_work_hours,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully created/updated SummerVoucherConfiguration for year "
                f"{year}."
            )
        )
