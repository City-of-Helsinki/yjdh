import logging
from collections import defaultdict

from django.db.models import PositiveBigIntegerField
from django.db.models.functions import Cast, Trim
from stdnum.fi.hetu import is_valid as is_valid_finnish_social_security_number

LOGGER = logging.getLogger(__name__)


def set_current_valid_serial_number_based_foreign_keys(
    employer_summer_voucher_model, youth_summer_voucher_model
):
    """
    Convert valid serial number strings in _obsolete_unclean_serial_number to actual valid
    ForeignKey references in youth_summer_voucher_id in EmployerSummerVoucher model.

    Matching is done first by purely numeric serial numbers, and if that fails, by matching
    social security number and creation year.
    """
    # Real data sizes in production on 2026-01-27 for memory and performance context:
    # ~8k EmployerSummerVoucher objects
    # ~17k YouthSummerVoucher objects
    # ~19k YouthApplication objects
    total_count = matched_by_ssn_count = matched_by_serial_count = 0

    # Load all YouthSummerVoucher objects into memory for efficient lookup:
    youth_vouchers = list(
        youth_summer_voucher_model.objects.select_related("youth_application").only(
            "id",
            "summer_voucher_serial_number",
            "youth_application__social_security_number",
            "youth_application__encrypted_social_security_number",
            "youth_application__created_at",
        )
    )

    # Create a mapping from unique serial numbers to YouthSummerVoucher for quick lookup:
    serial_to_youth_voucher = {
        v.summer_voucher_serial_number: v
        for v in youth_vouchers
        if v.summer_voucher_serial_number
    }

    # Create a mapping from valid social security numbers to YouthSummerVouchers for quick lookup:
    ssn_to_youth_vouchers = defaultdict(list)
    for v in youth_vouchers:
        ssn = v.youth_application.social_security_number
        if is_valid_finnish_social_security_number(ssn):
            ssn_to_youth_vouchers[ssn].append(v)

    employer_vouchers_to_update = []

    # Try to find matching YouthSummerVoucher for each EmployerSummerVoucher
    for employer_voucher in employer_summer_voucher_model.objects.all().iterator(
        chunk_size=1000
    ):
        total_count += 1
        serial_number = employer_voucher._obsolete_unclean_serial_number.strip()

        # Purely numeric serial numbers? These should be the majority
        if serial_number.isdigit() and (
            youth_voucher := serial_to_youth_voucher.get(int(serial_number))
        ):
            employer_voucher.youth_summer_voucher = youth_voucher
            employer_vouchers_to_update.append(employer_voucher)
            matched_by_serial_count += 1
        else:  # Try matching by social security number & application year
            youth_vouchers = [
                v
                for v in ssn_to_youth_vouchers.get(employer_voucher.employee_ssn, [])
                if v.youth_application.created_at.year
                == employer_voucher.created_at.year
                and v.youth_application.created_at <= employer_voucher.created_at
            ]
            # There should be only at most one youth voucher per SSN per year
            if len(youth_vouchers) == 1:
                youth_voucher = youth_vouchers[0]
                employer_voucher.youth_summer_voucher = youth_voucher
                employer_vouchers_to_update.append(employer_voucher)
                matched_by_ssn_count += 1

    # Bulk update all matched EmployerSummerVoucher objects
    updated_count = employer_summer_voucher_model.objects.bulk_update(
        employer_vouchers_to_update,
        ["youth_summer_voucher"],
        batch_size=500,  # To limit a single batch's SQL UPDATE clause size
    )

    # Log summary of results
    LOGGER.info(
        f"Handled {total_count} employer summer vouchers, updated {updated_count}:"
    )
    LOGGER.info(f"- Matched by voucher serial number: {matched_by_serial_count}")
    LOGGER.info(f"- Matched by social security number & year: {matched_by_ssn_count}")
    LOGGER.info(f"- Failed to match: {total_count - updated_count} and left as is")


def set_historical_serial_number_based_foreign_keys(
    historical_employer_summer_voucher_model,
):
    """
    Convert non-negative integer string values in _obsolete_unclean_serial_number to actual integer
    values in youth_summer_voucher_id in HistoricalEmployerSummerVoucher model.

    Not trying to make the historical records perfect, just doing the minimum obvious conversion.
    """
    total_count = historical_employer_summer_voucher_model.objects.count()

    # Real data in production was Jan 2026 around ~55k HistoricalEmployerSummerVoucher rows
    updated_count = historical_employer_summer_voucher_model.objects.filter(
        # Non-negative integer strings with possible leading/trailing whitespace:
        _obsolete_unclean_serial_number__regex=r"^\s*[0-9]+\s*$"
    ).update(
        youth_summer_voucher_id=Cast(
            Trim("_obsolete_unclean_serial_number"), PositiveBigIntegerField()
        )
    )

    LOGGER.info(f"Handled {total_count} historical employer summer vouchers:")
    LOGGER.info(f"- Converted numeric serial numbers to integers: {updated_count}")
    LOGGER.info(f"- Left as NULL: {total_count - updated_count}")
