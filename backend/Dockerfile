# ==============================
FROM helsinkitest/python:3.8-slim as appbase
# ==============================
RUN mkdir /entrypoint

COPY --chown=appuser:appuser requirements.txt /app/requirements.txt
COPY --chown=appuser:appuser requirements-prod.txt /app/requirements-prod.txt
COPY --chown=appuser:appuser .prod/escape_json.c /app/.prod/escape_json.c

RUN apt-install.sh \
        git \
        netcat \
        libpq-dev \
        build-essential \
    && pip install -U pip \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir  -r /app/requirements-prod.txt \
    && uwsgi --build-plugin /app/.prod/escape_json.c \
    && mv /app/escape_json_plugin.so /app/.prod/escape_json_plugin.so \
    && apt-cleanup.sh build-essential

COPY --chown=appuser:appuser docker-entrypoint.sh /entrypoint/docker-entrypoint.sh
ENTRYPOINT ["/entrypoint/docker-entrypoint.sh"]

# ==============================
FROM appbase as development
# ==============================

COPY --chown=appuser:appuser requirements-dev.txt /app/requirements-dev.txt
RUN apt-install.sh \
        build-essential \
    && pip install --no-cache-dir -r /app/requirements-dev.txt \
    && apt-cleanup.sh build-essential

ENV DEV_SERVER=1

COPY --chown=appuser:appuser . /app/

USER appuser
EXPOSE 8000/tcp

# ==============================
FROM appbase as production
# ==============================

COPY --chown=appuser:appuser . /app/

RUN SECRET_KEY="only-used-for-collectstatic" python manage.py collectstatic

USER appuser
EXPOSE 8000/tcp
