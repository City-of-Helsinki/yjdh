# YTJ Client (V3)

This module provides a pythonic interface to the [Finnish Trade Register (YTJ) Open Data API V3](https://avoindata.prh.fi/opendata-ytj-api/v3/).

## Overview

The client allows fetching company details using a Business ID (Y-tunnus). It handles the complexity of the V3 API response structure, parsing it into strongly-typed dataclasses and providing helper properties to access preferred values (e.g., prioritizing Finnish names and addresses).

## Key Components

- **`YTJClient`** (`ytj_client.py`): The main entry point. Use `get_company_info_with_business_id(business_id)` to get raw data or `get_company_data_from_ytj_data(data)` to extract a simplified dictionary for the application.
- **`YTJCompany`** (`ytj_dataclasses.py`): The root dataclass representing the API response. It contains logic for:
    - Language prioritization (FI > SV > EN).
    - Address prioritization (Visiting > Postal).
    - Data parsing from JSON.
- **`ytj_schema.yaml`**: A local copy of the OpenAPI V3 schema used for reference and validation during development.

## Usage

```python
from shared.ytj.ytj_client import YTJClient

client = YTJClient()

# 1. Fetch data
# Returns a dict matching the JSON response
data = client.get_company_info_with_business_id("1234567-8")

# 2. Extract simplified company info
# Returns:
# {
#   "name": "Company Oy",
#   "business_id": "1234567-8",
#   "company_form": "Osakeyhtiö",
#   "industry": "Ohjelmistokehitys",
#   "street_address": "Katu 1",
#   "postcode": "00100",
#   "city": "HELSINKI"
# }
company_info = YTJClient.get_company_data_from_ytj_data(data)
```

## Configuration

Required `django.conf.settings`:
- `YTJ_BASE_URL`: Base URL for the V3 API (e.g., `https://avoindata.prh.fi/opendata-ytj-api/v3`).
- `YTJ_TIMEOUT`: Request timeout in seconds.

## Development

The dataclasses in `ytj_dataclasses.py` are based on the OpenAPI specification.
See `ytj_schema.yaml` in this directory for the full schema definition.
