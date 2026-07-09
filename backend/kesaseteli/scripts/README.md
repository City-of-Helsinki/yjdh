<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Kesäseteli backend scripts](#kes%C3%A4seteli-backend-scripts)
  - [Scripts](#scripts)
    - [`filter_ytj_dump_by_business_ids.py`](#filter_ytj_dump_by_business_idspy)
    - [`populate_ytj_data_to_companies.py`](#populate_ytj_data_to_companiespy)
  - [Typical end-to-end workflow](#typical-end-to-end-workflow)
  - [Notes](#notes)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Kesäseteli backend scripts

Utility scripts for one-off data operations that are too large or complex
to run through the Django admin or a management command.

---

## Scripts

### `filter_ytj_dump_by_business_ids.py`

**When to use:**
When you have identified a set of companies in the database that are missing
YTJ data (`ytj_json` is null) and you want to backfill them from a full YTJ
data dump rather than hitting the live API for each one individually (e.g.
when the YTJ API is rate-limited, unavailable, or you need to process hundreds
of companies at once).

**What it does:**
Streams the ~1.5 GB YTJ full-company JSON dump and extracts only the records
whose `businessId` appears in a given list. Writes two output files:
- `data/data_<date>_filtered.json` — matched company records
- `data/business_ids_not_found.json` — business IDs with no match in the dump

Because it uses `ijson` to stream the file, it never loads the whole dump
into memory.

**How to get the source data:**
Download the full dump from the YTJ open data API (no authentication needed):

```text
https://avoindata.prh.fi/fi/ytj/swagger-ui
```

Use the `/all_companies` endpoint. The response is a ZIP archive. Extract it
into `scripts/data/` and update `YTJ_DATA_FILE` in the script to match the
filename.

**How to produce the business ID list (`BUSINESS_IDS_FILE`):**
Run a query against the database to collect the business IDs of companies
missing YTJ data, then save the result as a JSON array:

```python
# Example Django shell snippet (m shell)
import json
from companies.models import Company

ids = list(
    Company.objects.filter(ytj_json__isnull=True).values_list("business_id", flat=True)
)
print(json.dumps(sorted(ids), indent=4))
```

Save the output to `scripts/data/business_ids.json`.

**How to run:**

```bash
cd backend/kesaseteli/scripts
python filter_ytj_dump_by_business_ids.py
```

> The script can be run with any Python that has `ijson` installed. It does
> not require Django.

---

### `populate_ytj_data_to_companies.py`

**When to use:**
After running `filter_ytj_dump_by_business_ids.py`. Use this script to apply
the filtered company records to the database — updating existing companies or
creating new ones.

**What it does:**
Reads each record from the filtered JSON file and calls
`Company.objects.update_or_create` with the parsed field values:
- `name`, `company_form`, `industry`, `street_address`, `postcode`, `city`
- `organization_type` (derived from `company_form` using the same logic as
  the rest of the application)
- `ytj_json` (stored in the standard `{"companies": [<record>]}` wrapper)

Errors on individual records are printed with a full traceback and do not
abort the run. A summary is printed at the end.

**Prerequisites:**
1. Run `filter_ytj_dump_by_business_ids.py` first to produce
   `data/data_<date>_filtered.json`.
2. Update `FILTERED_DATA_FILE` in the script if the filename differs.
3. The Django database must be reachable from your environment (correct
   `.env` or environment variables for `DATABASE_URL` etc.).

**How to run:**

```bash
cd backend/kesaseteli/scripts
../../../.venv/bin/python populate_ytj_data_to_companies.py
```

Or from the repo root:

```bash
backend/kesaseteli/.venv/bin/python backend/kesaseteli/scripts/populate_ytj_data_to_companies.py
```

---

## Typical end-to-end workflow

```text
1. Query DB → save business_ids.json
       │
       ▼
2. Download YTJ dump (ZIP) → extract JSON → scripts/data/
       │
       ▼
3. python filter_ytj_dump_by_business_ids.py
       │
       ├── data/data_<date>_filtered.json     (matched records)
       └── data/business_ids_not_found.json   (no match in dump)
       │
       ▼
4. python populate_ytj_data_to_companies.py
       │
       └── Company rows updated / created in DB
```

Companies listed in `business_ids_not_found.json` were not present in the
dump and will need manual investigation or a live YTJ API lookup.

---

## Notes

- The `data/` directory is intentionally excluded from version control via
  `.gitignore` because it contains large binary/JSON files that should not
  be committed.
- Both scripts are safe to re-run. `filter_ytj_dump_by_business_ids.py`
  overwrites its output files. `populate_ytj_data_to_companies.py` uses
  `update_or_create`, so running it again is idempotent.
