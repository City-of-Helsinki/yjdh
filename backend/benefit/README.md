## DEBUGGING

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

This creates terms of service and applicant terms in the database. The attachment PDF files are not actually
created by loading the fixture. In order to actually download the PDF files, log in via the django admin
and upload the files manually.

### Daily running

* Inside the backend project root folder (backend/benefit), create `.env` file: `touch .env`
* Set the `DEBUG` environment variable to `1`.
* Run `python manage.py migrate`
* Run `python manage.py compilemessages`
* Run `python manage.py runserver 0:8000`

The project is now running at [localhost:8000](https://localhost:8000)

### Updating translations

In `backend/benefit/`:
* Run `python manage.py makemessages --no-location -l fi -l sv -l en`
* Run `python manage.py compilemessages`

### Testing and debugging

To run the backend without integrations, set NEXT_PUBLIC_MOCK_FLAG=1 in .env.benefit-backend
If NEXT_PUBLIC_MOCK_FLAG is set, additionally DUMMY_COMPANY_FORM can be set to test with different company_form parameters.

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
