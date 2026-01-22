## Development without Docker

Prerequisites:

* PostgreSQL 17
* Python 3.12

### Installing Python requirements

* Run `pip install -r requirements.txt`
* Run `pip install -r requirements-dev.txt` (development requirements)

**Known issues:** `psycopg2` installation often fails on macOS. Try to install it with `brew install postgresql` and then run `pip install psycopg2`, or for a more permanent but not so good solution, try `pip install psycopg2-binary`.

### Database

To setup a database compatible with default database settings:

Create user and database

    sudo -u postgres createuser -P -R -S kesaseteli  # use password `kesaseteli`
    sudo -u postgres createdb -O kesaseteli kesaseteli

Allow user to create test database

    sudo -u postgres psql -c "ALTER USER kesaseteli CREATEDB;"

### Daily running

* Create `.env.kesaseteli` file: `touch .env.kesaseteli`. An example can be found from monorepo root directory in `.env.kesaseteli.example`.
    * **NOTE:** The env file should be found in the root directory of the developed Django app (`backend/kesaseteli/.env.kesaseteli`). You can also use symlink to the env file.
    * **INFO:** If you want to run only the database from a Docker container, remember to configure `DATABASE_URL` so that it points to the database (e.g. `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kesaseteli`).
* Set the `DEBUG` environment variable to `1`.
* Run `python manage.py migrate`
* Run `python manage.py compilemessages`
* Run `python manage.py ensure_email_templates` (populates email templates)
* Run `python manage.py setup_admin_permissions` (sets up admin permissions)
* Run `python manage.py runserver 0:8000`

The project is now running at [localhost:8000](https://localhost:8000)

**INFO:** Test data for development purposes can be generated with factories that are also used in tests.

### Updating translations

In `backend/kesaseteli/`:
* Run `python manage.py makemessages --no-location -l fi -l sv -l en`
* Run `python manage.py compilemessages`

## Keeping Python requirements up to date

1. Install `pip-tools`:

    * `pip install pip-tools`
    * `pip install --upgrade pip-tools`

2. Add new packages to `requirements.in` or `requirements-dev.in`

3. Update `.txt` file for the changed requirements file:

    * `pip-compile requirements.in`
    * `pip-compile requirements-dev.in`
      * If the above fails with `Unnamed requirements are not allowed as constraints`
        * Comment out `-e file:../shared` in [requirements.txt](./requirements.txt)

4. If you want to update dependencies to their newest versions, run:

    * `pip-compile --upgrade requirements.in`

5. To install Python requirements run:

    * `pip-sync requirements.txt`

## Code format

This project uses [](https://docs.astral.sh/ruff/) for code formatting and quality checking.

Basic `ruff` commands:

* lint: `ruff check`
* apply safe lint fixes: `ruff check --fix`
* check formatting: `ruff format --check`
* format: `ruff format`

[`pre-commit`](https://pre-commit.com/) can be used to install and
run all the formatting tools as git hooks automatically before a
commit.

## Storages

This project uses
[`django-storages`](https://github.com/jschneier/django-storages)
for blob storage handling. Production / staging will use Azure blob storage
which requires the `DEFAULT_FILE_STORAGE` env variable / setting to be set to
`"storages.backends.azure_storage.AzureStorage"`. The following
env variables / settings are provided by Azure blob storage:

- `AZURE_ACCOUNT_NAME`
- `AZURE_ACCOUNT_KEY`

## Authentication Methods Overview

This section outlines the authentication mechanisms used across the three user interfaces and five environment types (Review, Dev, Test, Stage, and Production).

### Authentication by User Interface

| UI Name | Target Audience | Auth Method | Notes |
| :--- | :--- | :--- | :--- |
| **Youth** | Individual Applicants | **None** | Relies on backend SSN/VTJ validation. |
| **Employer** | Business Users | **Suomi.fi / OIDC** | SAML, except in review env, where it's OpenID Connect. |
| **Handler** | Internal Staff | **ADFS** | Authenticates via ADFS through the API. |

### Detailed Environment Logic

#### Youth UI
The Youth UI does not implement a login flow. To ensure data integrity:
* Applications are sent to the API.
* The API validates the Social Security Number (SSN).
* Personal data is fetched from **VTJ** (Population Information System).

#### Employer UI
Authentication for employers depends on the environment configuration, primarily managed by the `NEXT_PUBLIC_ENABLE_SUOMIFI` variable.

* **Standard Environments (Dev, Test, Stage, Production):**
    * `NEXT_PUBLIC_ENABLE_SUOMIFI=true`
    * Authenticates via **Suomi.fi** through the API's **SAML** endpoint.
    * **Certificate Requirements:** `SUOMIFI_CERT` and `SUOMIFI_KEY` environment variables are required.
* **Review Environments (Pull Requests):**
    * `NEXT_PUBLIC_ENABLE_SUOMIFI=false`
    * Uses `HelsinkiOIDCAuthenticationBackend`.
    * **OIDC Provider:** `https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus`
    * **Note:** This configuration is used because Review environments require dynamic URLs, which are difficult to manage with Suomi.fi's static SAML requirements. It also facilitates easier automated browser testing.

#### Handler UI
The Handler UI uses **ADFS** (Active Directory Federation Services) for all environments. The authentication is brokered through the API.
See [Staff Admin Permissions](staff_admin_permissions/README.md) for details on how ADFS groups map to Django admin permissions.

#### Mock Mode
When `NEXT_PUBLIC_MOCK_FLAG=true` (typically in local development):
*   **Employer UI**: Bypasses Suomi.fi/OIDC and uses a simulated login.
*   **Handler UI**: Bypasses ADFS and uses a simulated login.
*   **Youth UI**: Skips VTJ queries and uses mock data.

### Authentication Matrix

| Environment | Youth | Employer Auth Method | Handler Auth |
| :--- | :--- | :--- | :--- |
| **Review (PR)** | Open | **Helsinki OIDC** | ADFS |
| **Dev** | Open | **Suomi.fi (SAML)** | ADFS |
| **Test** | Open | **Suomi.fi (SAML)** | ADFS |
| **Stage** | Open | **Suomi.fi (SAML)** | ADFS |
| **Production** | Open | **Suomi.fi (SAML)** | ADFS |


## Environment Variables

| Variable | Description |
| :--- | :--- |
| `PASSWORD_LOGIN_DISABLED` | A boolean value. If set to True, disables username/password login in the admin site. Default is False. |
| `NEXT_PUBLIC_MOCK_FLAG` | A boolean value. If set to True, many aspects of the application are mocked, e.g. ADFS login which is used by the admin site. Default is False. |
| `NEXT_PUBLIC_DISABLE_VTJ` | A boolean value. If set to True, VTJ client usage is disabled. Default is False. |
| `CREATE_SUMMERVOUCHER_CONFIGURATION_CURRENT_YEAR` | A boolean value. If set to True, creates a new `SummerVoucherConfiguration` for the current year. Default is False. |
| `CREATE_SUMMERVOUCHER_CONFIGURATION_2026` | A boolean value. If set to True, creates a new `SummerVoucherConfiguration` for the year 2026. Default is False. |
| `AD_ADMIN_GROUP_NAME` | The name of the AD group that maps to Django admin permissions. Default is None (feature disabled). |

## Documentation

-   [Applications Module](applications/README.md): Documentation for Summer Voucher Configuration, Email Templates, Target Groups, and School Management.
-   [Staff Admin Permissions](staff_admin_permissions/README.md): Documentation for handling staff user permissions and AD group mappings.

### Summer Voucher Configuration

A `SummerVoucherConfiguration` for the current year is **required** for creating new `YouthApplication`s. If no configuration exists for the current year, the API will reject creation requests with a 400 Bad Request error.


### Management Commands

#### Create Summer Voucher Configuration

`python manage.py create_summervoucher_configuration`

Creates a new `SummerVoucherConfiguration` for the specified year.

**Arguments:**

*   `--year`: Year for the configuration (default: current year)
*   `--voucher-value`: Voucher value in euros (default: 350)
*   `--min-work-compensation`: Minimum work compensation in euros (default: 500)
*   `--min-work-hours`: Minimum work hours (default: 60)
*   `--target-groups`: List of target group identifiers (default: all)
*   `--force`: Force creation by overwriting existing configuration if it exists

**Docker Entrypoint:**

The `docker-entrypoint.sh` script can automatically run this command on startup using environment variables:

*   `CREATE_SUMMERVOUCHER_CONFIGURATION_CURRENT_YEAR=1`: Creates configuration for the current year.
*   `CREATE_SUMMERVOUCHER_CONFIGURATION_2026=1`: Creates configuration for the year 2026.
