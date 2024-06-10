import os
import re
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError

from applications.models import ArchivalApplication
from applications.tests.test_command_import_archival_applications import (
    ImportArchivalApplicationsTestUtility,
)
from companies.models import Company
from companies.services import get_or_create_organisation_with_business_id


def validate_data(row):
    from pandas import Timestamp

    return [
        validate_company_id(row["business_id"]),
        len(str(row["year_of_birth"])) == 4,
        type(row["start_date"]) is Timestamp,
        type(row["end_date"]) is Timestamp,
        datetime.now() > row["start_date"],
        datetime.now() > row["end_date"],
    ]


def validate_company_id(company_id):
    # Some old company id's have only 6 digits. They should be prefixed with 0.
    if re.match(r"^\d{6}\-\d", company_id):
        company_id = "0" + company_id

    # Ensure that the company ID is entered in correct format.
    if not re.match(r"^\d{7}\-\d", company_id):
        return False

    identifier, checksum = company_id.split("-")
    checksum = int(checksum)

    total_count = 0
    multipliers = [7, 9, 10, 5, 8, 4, 2]
    for key, multiplier in enumerate(multipliers):
        total_count = total_count + multiplier * int(identifier[key])

    remainder = total_count % 11

    # Remainder 1 is not valid.
    if remainder == 1:
        return False

    # Remainder 0 leads into checksum 0.
    if remainder == 0:
        return checksum == remainder

    # If remainder is not 0, the checksum should be remainder deducted from 11.
    return checksum == 11 - remainder


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--filename",
            type=str,
            default="test.xlsx",
            help="Filename for Excel spreadsheet to import,"
            "store spreadsheet under backend/benefit/applications/resources",
        )

        parser.add_argument(
            "--production",
            type=bool,
            default=None,
            help="Set to True to actually import the data, otherwise will only do a dry run",
        )

    def handle(self, filename, production, *args, **options):  # noqa
        # import at file level causes pytest crash
        is_pytest = os.environ.get("PYTEST_CURRENT_TEST")
        if is_pytest:

            def isna(value):
                return value is None

        else:
            from pandas import isna, read_excel

        EXPECTED_SPREADSHEET_COLUMNS = [
            "hakija",
            "Hakemusnro",
            "y-tunnus",
            "työllistetyn sukunimi",
            "työllistetyn etunimi",
            "alkaa",
            "loppuu",
            "kk",
            "synt. vuosi",
        ]

        KEYS = [
            "company_name",
            "application_number",
            "business_id",
            "employee_last_name",
            "employee_first_name",
            "start_date",
            "end_date",
            "months_total",
            "year_of_birth",
        ]

        KEYS_TO_IMPORT = [
            "application_number",
            "employee_last_name",
            "employee_first_name",
            "start_date",
            "end_date",
            "months_total",
            "year_of_birth",
        ]

        # mock data if it's a pytest run
        if is_pytest:
            columns = ImportArchivalApplicationsTestUtility.test_data["columns"]
            values = ImportArchivalApplicationsTestUtility.test_data["values"]
        else:
            filepath = os.path.abspath(os.path.dirname(__file__)) + "/../../resources"
            sheet = read_excel(f"{filepath}/{filename}")
            columns = sheet.columns
            values = sheet.values

        if not production:
            print(
                "\n ###################\n",
                "##### DRY RUN #####\n",
                "###################\n",
            )
        else:
            print(
                "\n ######################\n",
                "##### PRODUCTION #####\n",
                "######################\n",
            )
        print(f"Verifying data from {filename}")
        print(f"• Found {len(values)} rows of data with {len(columns)} columns")
        if len(KEYS) != len(EXPECTED_SPREADSHEET_COLUMNS):
            raise CommandError(
                "Mismatch in mapped keys and spreadsheet columns length, check spreadsheet and KEYS variable"
            )

        column_index = []
        for expected_col in EXPECTED_SPREADSHEET_COLUMNS:
            if expected_col not in columns:
                print(f'! Column "{expected_col}" not found in spreadsheet keys')
                raise CommandError("Excel is not in expected format")
            column_index.append(
                {
                    "index": list(columns).index(expected_col),
                    "name": expected_col,
                    "key": KEYS[list(EXPECTED_SPREADSHEET_COLUMNS).index(expected_col)],
                }
            )
        print("• Spreadsheet's column headers are as expected")

        mapped_rows = []
        for row in values:
            mapped_row = {}
            for column in column_index:
                value = row[column["index"]]
                if isna(value):
                    value = None
                if isinstance(value, float):
                    value = round(value, 2)
                mapped_row[column["key"]] = value

            mapped_rows.append(mapped_row)

        print(f"• Collected {len(mapped_rows)} rows to import")

        print("\nNow importing rows ...")

        rows_imported = 0
        for row in mapped_rows:
            application_number = row.get("application_number")
            print(
                f"\n{application_number}",
            )

            company_found = True
            pruned_data = {k: v for k, v in row.items() if k in KEYS_TO_IMPORT}

            company = None
            company_str = f"{row['company_name']} ({row['business_id']})"

            if not is_pytest and not all(validate_data(row)):
                print(
                    f"! Skipping: invalid data for {application_number} / {company_str}"
                )
                continue

            if production:
                try:
                    company = Company.objects.filter(
                        business_id=row["business_id"]
                    ).first()

                    if not company:
                        company = get_or_create_organisation_with_business_id(
                            row["business_id"]
                        )
                        print(f"• Found: company {company_str}")
                    else:
                        print(f"+ Created: company {company_str}")
                except Exception:
                    company_found = False
                    print(f"! Skipping: {company_str} not found")
                    continue

            if company_found:
                # Remove all conflicting archival applications with the same application number
                existing_apps = ArchivalApplication.objects.filter(
                    application_number=application_number
                )

                if existing_apps and production:
                    for app in existing_apps:
                        print("- Removing: imported previously")
                        app.delete()

                app = ArchivalApplication(**pruned_data, company=company)
                if production:
                    print("+ Created: application imported!")
                    app.save()
                    rows_imported += 1
                else:
                    print(f"• Skipping: {app.application_number}")

        print(f"\nDone! Imported {rows_imported} rows as ArchivalApplication.\n")
