#!/bin/bash

set -e

# Wait for the database
if [ -z "$SKIP_DATABASE_CHECK" -o "$SKIP_DATABASE_CHECK" = "0" ]; then
    wait-for-it.sh "${DATABASE_HOST}:${DATABASE_PORT-5432}" --timeout=30
fi

# Apply database migrations
if [[ "$APPLY_MIGRATIONS" = "1" ]]; then
    echo "Applying database migrations..."
    ./manage.py migrate --noinput
fi

# Create admin user. Generate password if there isn't one in the
# environment variables. Password is not printed to log, but needs to be
# changed at the pod command line
if [[ "$CREATE_SUPERUSER" = "1" ]]; then
    if [[ "$ADMIN_USER_PASSWORD" ]]; then
        DJANGO_SUPERUSER_PASSWORD=$ADMIN_USER_PASSWORD \
            DJANGO_SUPERUSER_USERNAME=admin \
            DJANGO_SUPERUSER_EMAIL=admin@hel.ninja \
            python /app/manage.py createsuperuser --noinput || true
    else
        DJANGO_SUPERUSER_PASSWORD=admin \
            DJANGO_SUPERUSER_USERNAME=admin \
            DJANGO_SUPERUSER_EMAIL=admin@hel.ninja \
            python /app/manage.py createsuperuser --noinput || true
    fi
fi

# Compile messages to make translations work
python ./manage.py compilemessages

# Start server
if [[ ! -z "$@" ]]; then
    "$@"
elif [[ "$DEV_SERVER" = "1" ]]; then
    python ./manage.py runserver 0.0.0.0:8000
else
    uwsgi --ini .prod/uwsgi.ini
fi
