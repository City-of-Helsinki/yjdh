"""
Populate Company model data from a filtered YTJ data dump.

Purpose
-------
After running filter_ytj_data.py, you have a filtered JSON file containing
company records from the YTJ full data dump. This script reads that file and
updates (or creates) the corresponding Company objects in the database with
the YTJ data — name, company form, industry, address, and the raw ytj_json.

Prerequisites
-------------
1. Run filter_ytj_data.py first to produce FILTERED_DATA_FILE.
2. The Django database must be accessible (i.e. the app must be configured
   and migrations applied). The script bootstraps Django itself using the
   kesaseteli.settings module, so no manage.py is required.
3. Run the script with the virtualenv Python interpreter:

     cd backend/kesaseteli/scripts
     ../.venv/bin/python populate_ytj_data_to_companies.py

   Or from anywhere:

     /path/to/.venv/bin/python /path/to/scripts/populate_ytj_data_to_companies.py

Behaviour
---------
- For each record in FILTERED_DATA_FILE, the script looks up the Company by
  business_id. If found, it updates all fields. If not found, it creates a
  new Company record.
- organization_type is derived automatically from company_form using the
  same resolve_organization_type() function used by the rest of the app.
- ytj_json is stored in the {"companies": [<record>]} wrapper format for
  compatibility with the standard YTJ API response shape.
- Errors on individual records are logged with a full traceback and do not
  abort the run. A summary is printed at the end.
"""

import json
import os
import sys
import traceback

import django

# Add the parent directory of 'scripts' to the Python path so Django imports work
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.append(BACKEND_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kesaseteli.settings")
django.setup()

from companies.models import Company  # noqa: E402

FILTERED_DATA_FILE = os.path.join(SCRIPT_DIR, "data", "data_20260709_filtered.json")


def resolve_organization_type(company_form: str) -> str:
    """
    Map a YTJ company_form string to an OrganizationType value string.

    Inlined from companies.services to avoid importing that module, which
    pulls in heavy dependencies (sentry_sdk, test factories, YTJClient, etc.)
    that may not be available in all execution environments.
    """
    form = (company_form or "").lower()
    if any(kw in form for kw in ("yhdistys", " ry", "ry ", "ry)")):
        return "association"
    if any(kw in form for kw in ("seurakunta", "kirkko")):
        return "parish"
    return "company"


def _get_preferred_description(descriptions: list, preferred_langs=("1", "2")) -> str:
    """Return the first available description for the given language priority."""
    for lang in preferred_langs:
        value = next(
            (
                d.get("description")
                for d in descriptions
                if d.get("languageCode") == lang
            ),
            None,
        )
        if value:
            return value
    return ""


def parse_record(record: dict) -> dict:
    """
    Parse a raw YTJ company record dict into Company model fields.

    Mirrors the logic in YTJCompany / YTJClient without using those classes,
    so that extra API fields (e.g. postCode/active on postOffices) don't cause errors.
    """
    # Name: Prefer type "1" (main name), fallback to first available
    names = record.get("names", [])
    name_obj = next((n for n in names if n.get("type") == "1"), None) or (
        names[0] if names else None
    )
    name = name_obj.get("name", "") if name_obj else ""

    # Company form: Finnish description > Swedish > type code
    company_form = ""
    company_forms = record.get("companyForms", [])
    if company_forms:
        cf = company_forms[0]
        company_form = _get_preferred_description(cf.get("descriptions", [])) or cf.get(
            "type", ""
        )

    # Industry: Finnish description > Swedish
    industry = ""
    mbl = record.get("mainBusinessLine")
    if mbl:
        industry = _get_preferred_description(mbl.get("descriptions", []))

    # Address: prefer type 1 (visiting), fallback to type 2 (postal)
    addresses = record.get("addresses", [])
    addr = next((a for a in addresses if a.get("type") == 1), None)
    if addr is None:
        addr = next((a for a in addresses if a.get("type") == 2), None)

    street_address = ""
    postcode = ""
    city = ""
    if addr:
        street_address = addr.get("street") or ""
        postcode = addr.get("postCode") or ""
        post_offices = addr.get("postOffices", [])
        for lang in ("1", "2"):
            city = next(
                (
                    po.get("city")
                    for po in post_offices
                    if po.get("languageCode") == lang
                ),
                None,
            )
            if city:
                break
        if not city and post_offices:
            city = post_offices[0].get("city") or ""

    return {
        "name": name,
        "company_form": company_form,
        "industry": industry,
        "street_address": street_address,
        "postcode": postcode,
        "city": city,
    }


def populate_companies():
    """
    Read filtered YTJ company records from FILTERED_DATA_FILE and upsert
    them into the Company model.

    For each record:
    - Parses the raw YTJ JSON into Company field values (name, company_form,
      industry, street_address, postcode, city).
    - Looks up the existing Company by business_id.
      - If found: updates all fields including ytj_json.
      - If not found: creates a new Company record.
    - Derives organization_type automatically from company_form.
    - Stores the raw YTJ record in ytj_json wrapped as {"companies": [record]}
      to match the standard YTJ API response shape.

    Errors on individual records are caught, printed with a full traceback,
    and counted — they do not abort the run. A summary of updated/created/
    errored records is printed at the end.
    """

    if not os.path.exists(FILTERED_DATA_FILE):
        print(f"Error: Filtered data file not found at {FILTERED_DATA_FILE}")  # noqa: T201
        return

    with open(FILTERED_DATA_FILE, "r") as f:
        try:
            records = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")  # noqa: T201
            return

    print(f"Loaded {len(records)} records from filtered data file.")  # noqa: T201

    updated_count = 0
    created_count = 0
    error_count = 0

    for record in records:
        business_id = record.get("businessId", {}).get("value")
        if not business_id:
            print("Warning: Record missing businessId value, skipping.")  # noqa: T201
            error_count += 1
            continue

        try:
            company_data = parse_record(record)

            # Normalize city to Title Case (e.g. "Helsinki" not "HELSINKI")
            city = company_data.get("city")
            if city:
                company_data["city"] = city.title()

            # Wrap in expected ytj_json format for system compatibility
            ytj_data = {"companies": [record]}

            _, created = Company.objects.update_or_create(
                business_id=business_id,
                defaults={
                    **company_data,
                    "organization_type": resolve_organization_type(
                        company_data.get("company_form", "")
                    ),
                    "ytj_json": ytj_data,
                },
            )

            if created:
                created_count += 1
                print(f"Created: {company_data['name']} ({business_id})")  # noqa: T201
            else:
                updated_count += 1
                print(f"Updated: {company_data['name']} ({business_id})")  # noqa: T201

        except Exception as e:
            print(f"Error processing business ID {business_id}: {e}")  # noqa: T201
            traceback.print_exc()
            error_count += 1

    print("\nPopulation summary:")  # noqa: T201
    print(f"  Updated: {updated_count}")  # noqa: T201
    print(f"  Created: {created_count}")  # noqa: T201
    print(f"  Errors:  {error_count}")  # noqa: T201


if __name__ == "__main__":
    populate_companies()
