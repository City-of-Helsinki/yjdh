#!/bin/bash

python /app/manage.py migrate --noinput
python /app/manage.py loaddata groups.json
python /app/manage.py set_group_permissions

# Generate the admin user using the password given in the environment variables.
# If no password is set, the admin user gets a generated password. Password is
# not printed out, but needs to be reset in pod command line
if [[ "$ADMIN_USER_PASSWORD" ]]; then
    DJANGO_SUPERUSER_PASSWORD=$ADMIN_USER_PASSWORD DJANGO_SUPERUSER_USERNAME=admin DJANGO_SUPERUSER_EMAIL=admin@hel.ninja python /app/manage.py createsuperuser --noinput || true
else
    DJANGO_SUPERUSER_USERNAME=admin DJANGO_SUPERUSER_EMAIL=admin@hel.ninja python /app/manage.py createsuperuser --noinput || true
fi
