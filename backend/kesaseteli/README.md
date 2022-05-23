## Development without Docker

Prerequisites:

* PostgreSQL 12
* Python 3.8

### Installing Python requirements

* Run `pip install -r requirements.txt`
* Run `pip install -r requirements-dev.txt` (development requirements)

### Database

To setup a database compatible with default database settings:

Create user and database

    sudo -u postgres createuser -P -R -S kesaseteli  # use password `kesaseteli`
    sudo -u postgres createdb -O kesaseteli kesaseteli

Allow user to create test database

    sudo -u postgres psql -c "ALTER USER kesaseteli CREATEDB;"

### Daily running

* Create `.env.kesaseteli` file: `touch .env.kesaseteli`
* Set the `DEBUG` environment variable to `1`.
* Run `python manage.py migrate`
* Run `python manage.py compilemessages`
* Run `python manage.py runserver 0:8000`

The project is now running at [localhost:8000](https://localhost:8000)

### Updating translations

In `backend/kesaseteli/`:
* Run `python manage.py makemessages --no-location -l fi -l sv -l en`
* Run `python manage.py compilemessages`

## Keeping Python requirements up to date

1. Install `pip-tools`:

    * `pip install pip-tools`

2. Add new packages to `requirements.in` or `requirements-dev.in`

3. Update `.txt` file for the changed requirements file:

    * `pip-compile requirements.in`
    * `pip-compile requirements-dev.in`
    * If the above [fail with ImportError](https://github.com/jazzband/pip-tools/issues/1617) you may need an older pip installed:
      * `pip install --upgrade pip==22.0.1`

4. If you want to update dependencies to their newest versions, run:

    * `pip-compile --upgrade requirements.in`

5. To install Python requirements run:

    * `pip-sync requirements.txt`

## Code format

This project uses
[`black`](https://github.com/psf/black),
[`flake8`](https://gitlab.com/pycqa/flake8) and
[`isort`](https://github.com/PyCQA/isort)
for code formatting and quality checking. Project follows the basic
black config, without any modifications.

Basic `black` commands:

* To let `black` do its magic: `black .`
* To see which files `black` would change: `black --check .`

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
