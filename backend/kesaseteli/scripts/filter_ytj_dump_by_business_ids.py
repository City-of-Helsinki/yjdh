"""
Filter a full YTJ company data dump to only the companies we care about.

How to get the source data
--------------------------
All Finnish companies can be downloaded from the YTJ open data API:
  https://avoindata.prh.fi/fi/ytj/swagger-ui

Use the /all_companies endpoint (no authentication required). The response
is a ZIP archive containing a single ~1.5 GB JSON file. Extract the JSON
file into the data/ directory next to this script and update YTJ_DATA_FILE
below to match the filename.

Expected JSON structure (each top-level element is one company):
  [{"businessId": {"value": "0184194-4", "registrationDate": "1978-03-15", ...}, ...}]

This script streams the large file with ijson so it never loads the whole
thing into memory, then writes two output files:
  - FILTERED_DATA_FILE  : company records whose business ID is in BUSINESS_IDS_FILE
  - NOT_FOUND_DATA_FILE : business IDs from BUSINESS_IDS_FILE with no match in the dump

Next step
---------
Once this script has produced FILTERED_DATA_FILE, run populate_ytj_data_to_companies.py
to apply the filtered company records to the database:

  python populate_ytj_data_to_companies.py
"""

import json
import os

import ijson

# Absolute path to the directory containing this script.
# Used as an anchor so the script can be run from any working directory.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# JSON array of business ID strings to keep, e.g. ["0108466-4", "0109797-5", ...].
# Produced separately by querying the database for companies missing YTJ data.
BUSINESS_IDS_FILE = os.path.join(SCRIPT_DIR, "data", "business_ids.json")

# The extracted JSON file from the YTJ /all_companies ZIP download.
# Update the filename to match whichever dump you downloaded.
YTJ_DATA_FILE = os.path.join(SCRIPT_DIR, "data", "data_20260709.json")

# Output: company records from YTJ_DATA_FILE whose business ID matched
# BUSINESS_IDS_FILE.
FILTERED_DATA_FILE = os.path.join(SCRIPT_DIR, "data", "data_20260709_filtered.json")

# Output: business IDs from BUSINESS_IDS_FILE that were NOT found in YTJ_DATA_FILE.
# Useful for identifying companies that may need manual lookup or data correction.
NOT_FOUND_DATA_FILE = os.path.join(SCRIPT_DIR, "data", "business_ids_not_found.json")

# 1. Load your 900 IDs into a Set
with open(BUSINESS_IDS_FILE, "r") as id_file:
    valid_ids = set(json.load(id_file))

not_found_ids = set(valid_ids)

# 2. Stream the large JSON array
with (
    open(YTJ_DATA_FILE, "rb") as infile,
    open(FILTERED_DATA_FILE, "w") as outfile,
):
    # Start the new JSON array
    outfile.write("[\n")
    is_first = True

    # ijson.items streams objects out of the array one by one
    for record in ijson.items(infile, "item"):
        val = record.get("businessId", {}).get("value")
        if val in valid_ids:
            not_found_ids.discard(val)
            if not is_first:
                outfile.write(",\n")

            # Write the matching object to the new file
            json.dump(record, outfile)
            is_first = False

    # Close the new JSON array
    outfile.write("\n]")

# 3. Write missing IDs to a separate file
with open(NOT_FOUND_DATA_FILE, "w") as missing_file:
    json.dump(sorted(list(not_found_ids)), missing_file, indent=4)
