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
        len(str(int(row["year_of_birth"] or 0))) == 4,
        type(row["start_date"]) is Timestamp,
        type(row["end_date"]) is Timestamp,
        datetime.now() > row["start_date"],
    ]


def validate_company_id(company_id):
    # Some old company id's have only 6 digits. They should be prefixed with 0
    if re.match(r"^\d{6}\-\d", company_id):
        company_id = "0" + company_id

    # Ensure that the company ID is entered in correct format
    if not re.match(r"^\d{7}\-\d", company_id):
        return False

    identifier, checksum = company_id.split("-")
    checksum = int(checksum)

    total_count = 0
    multipliers = [7, 9, 10, 5, 8, 4, 2]
    for key, multiplier in enumerate(multipliers):
        total_count = total_count + multiplier * int(identifier[key])

    remainder = total_count % 11

    # Remainder 1 is not valid
    if remainder == 1:
        return False

    # Remainder 0 leads into checksum 0
    if remainder == 0:
        return checksum == remainder

    # If remainder is not 0, the checksum should be remainder deducted from 11
    return checksum == 11 - remainder


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--filename",
            type=str,
            default="test.xlsx",
            help=(
                "Filename for Excel spreadsheet to import,"
                "store spreadsheet under backend/benefit/applications/resources"
            ),
        )

        parser.add_argument(
            "--sheet_name",
            type=str,
            default="0",
            help="Spreadsheet file's sheet number",
        )

        parser.add_argument(
            "--production",
            type=bool,
            default=None,
            help=(
                "Set to True to actually import the data, otherwise will only do a"
                " dry run"
            ),
        )

    def handle(self, filename, production, sheet_name, *args, **options):  # noqa
        # import at file level causes pytest crash
        is_pytest = os.environ.get("PYTEST_CURRENT_TEST")
        if is_pytest:

            def isna(value):
                return value is None

        else:
            from pandas import isna, read_excel

        expected_spreadsheet_columns = {
            "company_name": "hakija",
            "application_number": "Hakemusnro",
            "business_id": "y-tunnus",
            "employee_last_name": "työllistetyn sukunimi",
            "employee_first_name": "työllistetyn etunimi",
            "start_date": "alkaa",
            "end_date": "loppuu",
            "months_total": "kk",
            "year_of_birth": "synt. vuosi",
        }

        optional_spreadsheet_columns = {"handled_at": "Päätöspäivä"}

        # mock data if it's a pytest run
        if is_pytest:
            columns = ImportArchivalApplicationsTestUtility.test_data["columns"]
            spreadsheet_data = ImportArchivalApplicationsTestUtility.test_data["values"]
        else:
            filepath = os.path.abspath(os.path.dirname(__file__)) + "/../../resources"
            sheet = read_excel(
                f"{filepath}/{filename}",
                sheet_name=(int(sheet_name) if sheet_name.isnumeric() else sheet_name),
            )
            columns = [x.strip(" ") for x in sheet.columns]
            spreadsheet_data = sheet.values

        columns = [x.strip(" ") for x in columns]

        if not production:
            print(  # noqa: T201
                "\n ###################\n",
                "##### DRY RUN #####\n",
                "###################\n",
            )
        else:
            print(  # noqa: T201
                "\n ######################\n",
                "##### PRODUCTION #####\n",
                "######################\n",
            )
        print(f"Verifying data from {filename}")  # noqa: T201
        print(  # noqa: T201
            f"• Found {len(spreadsheet_data)} rows of data with {len(columns)} columns"
        )

        column_index = []

        for technical_key, spreadsheet_key in expected_spreadsheet_columns.items():
            if spreadsheet_key not in columns:
                print(f'! Column "{spreadsheet_key}" not found in spreadsheet keys')  # noqa: T201
                raise CommandError("Excel is not in expected format")
            column_index.append(
                {
                    "index": list(columns).index(spreadsheet_key),
                    "name": spreadsheet_key,
                    "key": technical_key,
                }
            )
        print("• Spreadsheet's column headers are as expected")  # noqa: T201

        for technical_key, spreadsheet_key in optional_spreadsheet_columns.items():
            if spreadsheet_key in columns:
                column_index.append(
                    {
                        "index": list(columns).index(spreadsheet_key),
                        "name": spreadsheet_key,
                        "key": technical_key,
                    }
                )

        mapped_rows = []
        for row in spreadsheet_data:
            mapped_row = {}
            for column in column_index:
                spreadsheet_key = row[column["index"]]
                if isna(spreadsheet_key):
                    spreadsheet_key = None
                if isinstance(spreadsheet_key, float):
                    spreadsheet_key = round(spreadsheet_key, 2)
                mapped_row[column["key"]] = spreadsheet_key

            mapped_rows.append(mapped_row)

        print(f"• Collected {len(mapped_rows)} rows to import")  # noqa: T201

        print("\nNow importing rows ...")  # noqa: T201

        rows_imported = 0
        rows_skipped = 0
        for row in mapped_rows:
            application_number = row.get("application_number")
            print(  # noqa: T201
                f"\n{application_number}",
            )

            company_found = True
            company = None
            company_str = f"{row['company_name']} ({row['business_id']})"

            if not is_pytest and not all(validate_data(row)):
                rows_skipped += 1
                print(  # noqa: T201
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
                        print(f"• Found: company {company_str}")  # noqa: T201
                    else:
                        print(f"+ Created: company {company_str}")  # noqa: T201
                except Exception:
                    company_found = False
                    print(f"! Skipping: {company_str} not found")  # noqa: T201
                    continue

            if company_found:
                # Remove all conflicting archival applications with the same application
                # number
                existing_apps = ArchivalApplication.objects.filter(
                    application_number=application_number
                )

                if existing_apps and production:
                    for app in existing_apps:
                        print("- Removing: imported previously")  # noqa: T201
                        app.delete()

                row.pop("company_name")
                row.pop("business_id")
                app = ArchivalApplication(**row, company=company)
                if production:
                    print("+ Created: application imported!")  # noqa: T201
                    app.save()
                    rows_imported += 1
                else:
                    print(f"• Skipping: {app.application_number}")  # noqa: T201

        print(  # noqa: T201
            f"\nDone! Imported {rows_imported} rows as ArchivalApplication.\nSkipped"
            f" {rows_skipped} rows.\n"
        )
