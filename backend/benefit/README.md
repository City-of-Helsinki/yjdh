## Notes for developers

### Please take NEXT_PUBLIC_MOCK_FLAG into account

Since [PR #1477](https://github.com/City-of-Helsinki/yjdh/pull/1477) (October 2022)
NEXT_PUBLIC_MOCK_FLAG has been used for disabling authentication and for mocking
company information in the backend.

Please **take NEXT_PUBLIC_MOCK_FLAG into account when changing/adding code which handles
permissions, authentication** etc. There are automated backend tests related to
NEXT_PUBLIC_MOCK_FLAG's functionality but they are not fully comprehensive.

A better way to fix this would be implementing [HL-582](https://helsinkisolutionoffice.atlassian.net/browse/HL-582)
i.e. "Mock both applicant and handler logins (Applicant uses OIDC, handler uses ADFS)".

## Development without Docker

Prerequisites:

- PostgreSQL 12
- Python 3.8

### Installing Python requirements

- Run `pip install -r requirements.txt`
- Run `pip install -r requirements-dev.txt` (development requirements)
- If you are not using Docker image, in order to export application batch as PDF (via `pdfkit`), it's required to install
  `wkhtmltopdf`. Run: `sudo apt-get install wkhtmltopdf`

### Database

To setup a database compatible with default database settings:

Create user and database

    sudo -u postgres createuser -P -R -S helsinkibenefit  # use password `helsinkibenefit`
    sudo -u postgres createdb -O helsinkibenefit helsinkibenefit

Allow user to create test database

    sudo -u postgres psql -c "ALTER USER helsinkibenefit CREATEDB;"

Load test fixtures

    python manage.py loaddata default_terms.json
    python manage.py loaddata groups.json

This creates terms of service and applicant terms in the database. The attachment PDF files are not actually
created by loading the fixture. In order to actually download the PDF files, log in via the django admin
and upload the files manually.

Set default permissions

    python manage.py set_group_permissions

This creates permissions for the handler's group so they have access to the Terms in
the django admin.

### Configure docker environment

In the yjdh project root, set up the .env.benefit-backend file: `cp .env.benefit-backend.example .env.benefit-backend`
Edit the file, and add the missing passwords/client ids/secrets. The values can be retrieved from Azure key vault
at the Azure portal. Use the values from the key vault of the dev or test environment.

### Daily running with Docker

In the project root folder, run:

`docker compose -f compose.benefit.yml up`

This will bring up Postgres, backend, as well as the handler and applicant UIs.
Note - in order to run the handler and applicant UIs, you need to set up
also their .env files, see instructions in the frontend folder

### Daily running without Docker

- Inside the backend project root folder (backend/benefit), create `.env` file: `touch .env`
- Set the `DEBUG` environment variable to `1`.
- Run `python manage.py migrate`
- Run `python manage.py compilemessages`
- Run `python manage.py runserver 0:8000`

The project is now running at [localhost:8000](https://localhost:8000)

### Updating translations

In `backend/benefit/`:

- Run `python manage.py makemessages --no-location -l fi -l sv -l en`
- Run `python manage.py compilemessages`

### Testing and debugging

To run the backend without integrations/authentication, set NEXT_PUBLIC_MOCK_FLAG=1 in
.env.benefit-backend If NEXT_PUBLIC_MOCK_FLAG is set, additionally
DUMMY_COMPANY_FORM_CODE can be set to test with different company_form parameters.

To seed the database with some mock application data, run `python manage.py seed`
, which by default generates 10 applications for each of the seven possible application statuses and one attachment with a .pdf-file for each of them. To generate more applications, use the optional `--number` flag, for example, running `python manage.py seed --number=30` creates 30 applications of each status. **Note that running the command deletes all previous application data from the database and clears the media folder.**

[Mailhog](https://github.com/mailhog) is available for the local development environment (localhost:8025)[http://localhost:8025/] for previewing
and testing the emails sent by the application after setting the `EMAIL_HOST` and `EMAIL_PORT` as in the `.env.benefit-backend.example`.

**Using LOAD_FIXTURES=1 is recommended for local testing** as it loads e.g. default
terms which are required for an applicant to be able to successfully send in an
application using the applicant UI.

## Keeping Python requirements up to date

1. Install `pip-tools`:

   - `pip install pip-tools`

2. Add new packages to `requirements.in` or `requirements-dev.in`

3. Update `.txt` file for the changed requirements file:

   - `pip-compile requirements.in`
   - `pip-compile requirements-dev.in`

4. If you want to update dependencies to their newest versions, run:

   - `pip-compile --upgrade requirements.in`

5. To install Python requirements run:

   - `pip-sync requirements.txt requirements-dev.txt`

## Documentation

The OpenAPI schema is served from [https://127.0.0.1:8000/openapi/](https://127.0.0.1:8000/openapi/).

Swagger documentation can be found at [https://localhost:8000/api_docs/swagger/](https://localhost:8000/api_docs
/swagger/)
and redoc documentation at [https://localhost:8000/api_docs/redoc/](https://localhost:8000/api_docs/redoc/)

(Assuming you are running the project locally)

- `ModelSerializer`'s model fields defined in `Meta.fields` are given a description using `help_text` via `extra_kwargs`.
  ```python
  class Meta:
      extra_kwargs = {
          "field_name": {
              "help_text": "Field description.",
          }
      }
  ```
- Non-model fields are given a description using `help_text` kwarg on the field.
  ```python
  field_name = serializers.SerializerMethodField(help_text="Field description.")
  ```
- Filters are given a description using `help_text` kwarg on the filter.
  ```python
  filter_name = filters.NumberFilter(help_text="Filter description.")
  ```
- ViewSets are given a description either by giving the class a docstring or by using the `extend_schema` decorator on the class.
  ```python
  @extend_schema(description="ViewSet description.")
  ```
  `extend_schema` overrides docstring, if both are used.
- View specific descriptions within a ViewSet can be given using the `extend_schema_view` decorator on the ViewSet class.
  ```python
  @extend_schema_view(
      list=extend_schema(description="list description."),
      create=extend_schema(description="create description."),
  )
  ```
- `SerializerMethodField`s are given a type using type hinting.
  ```python
  available_benefit_types = serializers.SerializerMethodField(
    "get_available_benefit_types"
  )
  @extend_schema_field(serializers.ChoiceField(choices=BenefitType.choices), help_text="help")
    def get_available_benefit_types(self, obj):
  ```

## Scheduled jobs

Jobs can be scheduled using the Django extensions-package and setting the jobs to run as a cronjob.
Currently configured jobs (registered in the `applications/jobs`-directory):

- Daily: check applications that have been in the cancelled state for 30 or more days and delete them.

## Code format

This project uses
[`black`](https://github.com/psf/black),
[`flake8`](https://gitlab.com/pycqa/flake8) and
[`isort`](https://github.com/PyCQA/isort)
for code formatting and quality checking. Project follows the basic
black config, without any modifications.

Basic `black` commands:

- To let `black` do its magic: `black .`
- To see which files `black` would change: `black --check .`

## Storages

This project uses
[`django-storages`](https://github.com/jschneier/django-storages)
for blob storage handling. Production / staging will use Azure blob storage
which requires the `DEFAULT_FILE_STORAGE` env variable / setting to be set to
`"storages.backends.azure_storage.AzureStorage"`. The following
env variables / settings are provided by Azure blob storage:

- `AZURE_ACCOUNT_NAME`
- `AZURE_ACCOUNT_KEY`
- `AZURE_CONTAINER`

## Sentry error monitoring

The `local`, `development` and `testing` environments are connected to the Sentry instance at [`https://sentry.test.hel.ninja/`](https://sentry.test.hel.ninja/) under the `yjdh-benefit`-team.
There are separate Sentry projects for the Django api (`yjdh-benefit-api`), handler UI (`yjdh-benefit-handler`) and applicant UI (`yjdh-benefit-applicant`).
To limit the amount of possibly sensitive data sent to Sentry, the same configuration as in kesaseteli is used by default, see [`https://github.com/City-of-Helsinki/yjdh/pull/779`](https://github.com/City-of-Helsinki/yjdh/pull/779).

## AHJO integration
Making request to the AHJO REST api requires a Bearer token in the authorization headers.
### Retrieving the access_token

The token is retrieved following the Oauth 2.0 flow.
To retrieve the token in Django with AhjoConnector class,
the following settings need to be configured for Django:
```
AHJO_CLIENT_ID
AHJO_CLIENT_SECRET
AHJO_TOKEN_URL
AHJO_REST_API_UR
AHJO_REDIRECT_URL
```

1. The first step is to navigate via browser to (maintenance VPN enabled on local dev environment) [`https://johdontyopoytahyte.hel.fi/ids4/connect/authorize?scope=openid%20offline_access&response_type=code&redirect_uri=https://helsinkilisa/dummyredirect.html&client_id=client_id_goes_here`](https://johdontyopoytahyte.hel.fi/ids4/connect/authorize?scope=openid%20offline_access&response_type=code&redirect_uri=https://helsinkilisa/dummyredirect.html&client_id=client_id_goes_here)
  - `scope=openid offline_access` is required so that the actual token call also returns a refresh token.
  - `redirect_uri` is dummy according t, because it is not needed for anything after this, but it must be defined.
2. Login to the form with AD credentials (ask from fellow developer)
3. Submitting the form redirects the browser to the redirect_uri parameter address, for example
`https://helsinkilisa/dummyredirect.html?code=5510FE3A7A99D4A8D0FB69C0BAB70A31DD38243EFB1D606B1F96FE75383684E4-1&scope=offline_access&iss=https%3A%2F%2Fjohdontyopoytahyte.hel.fi%2Fids4`
  - Again the `redirect_uri parameter` has no other use, so it can be  dummyredirect.html
  - from this return address the `code` parameter is taken, in the example above:
  `5510FE3A7A99D4A8D0FB69C0BAB70A31DD38243EFB1D606B1F96FE75383684E4-1`
4. In the Django admin, on the AhjoSetting tab, set the setting ahjo_code to a JSON object:
`{"code": "5510FE3A7A99D4A8D0FB69C0BAB70A31DD38243EFB1D606B1F96FE75383684E4-1"}`
5. Now the AhjoConnector class can fetch the new token. At this stage of development, there is one dummy function for testing authentication, which can be used like this:
`$ python manage.py shell`
`$ from applications.services.ahjo_integration import dummy_ahjo_request`
`$ dummy_ahjo_request()`
6. Unless there is an error, there will be a new ahjo_access_token object (example below) in the database, which can be used for making actual requests to AHJO. 
```JSON
{"expires_in": "2023-10-06T21:02:14.459161", "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IkY1QUMzRjhGNjNDQTdGQjc0QzgxODc1RkYyNTQ4M0YyMzI0RTNFMjNSUzI1NiIsIng1dCI6Ijlhd19qMlBLZjdkTWdZZGY4bFNEOGpKT1BpTSIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwczovL2pvaGRvbnR5b3BveXRhaHl0ZS5oZWwuZmkvaWRzNCIsIm5iZiI6MTY5NjU4NTMzNCwiaWF0IjoxNjk2NTg1MzM0LCJleHAiOjE2OTY2MTUzMzQsImF1ZCI6Imh0dHBzOi8vam9oZG9udHlvcG95dGFoeXRlLmhlbC5maS9pZHM0L3Jlc291cmNlcyIsInNjb3BlIjpbIm9wZW5pZCIsIm9mZmxpbmVfYWNjZXNzIl0sImFtciI6WyJwd2QiXSwiY2xpZW50X2lkIjoiaGVsc2lua2lsaXNhIiwic3ViIjoiaGVsbGlzYWh5dCIsImF1dGhfdGltZSI6MTY5NTgwNzgzNywiaWRwIjoibG9jYWwiLCJzaWQiOiJBM0NFNkZFN0FBQkREMzQ4MUJBQTlBQzgzREVCRTZFNCIsImp0aSI6IjcyMzAyRkY0MjEwRkYxQTE4RTA1RDFFQTZCQTUwNDc3In0.iJOgkX4P1eNqDCVmXP2U198U_YIF0labba3hRP2x8oUA3DmCqCpPxvLIdMuxJ5N--xtqrW2hJw2X6XS-GQa9aSODwP5Tt5XLvzMthAzD6m4Y09uaZFoVGqvBu8Cc6oedJNQknQKTiK8vyhoHrXoG-ACOoYs1JtUBOsqR-SIgIpEZepWp3XcjlcVsSnqf1j1YTsRDl5FfoIv1lZSFTAlRmEZGirL1rRDm_2pR_HQ4y20KAaoZaBuyVoyf89duSGmvf40FlImLMXWuIcS7FkIrMUNogdgRittSJKRj5yfRnCgzjBndn0OptWtzXk5GZPfQeGERwVMJaD82X843j5UX4g", "refresh_token": "BB2AE7A54C9EB4374FCB69B21AE75484D9C33094DD92C4DADD48F5806FE726F3-1"}
```
7. In the future, it is intended that the token will be continuously refreshed with a cron job (see refreshing the token), so points 1-4 are not needed unless for some reason the token refresh fails during the 8-hour period when the token is valid

### Refreshing the token
The token retrieved the first time is valid for 30,000 seconds, or about 8 hours. A successful token call also returns the refresh_token information, which is also stored in the Django database. Django has a registered command refresh_ahjo_token which can be scheduled to perform token refresh. The command can be run manually with
`$ python manage.py refresh_ahjo_token`