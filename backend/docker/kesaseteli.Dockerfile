# ==============================
FROM postgres:12 as finnish_postgres
# ==============================
RUN sed -i -e 's/# fi_FI.UTF-8 UTF-8/fi_FI.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen
ENV LANG fi_FI.UTF-8
ENV LANGUAGE fi_FI:fi
ENV LC_ALL fi_FI.UTF-8

# ==============================
FROM helsinkitest/python:3.8-slim as appbase
# ==============================
RUN mkdir /entrypoint

COPY --chown=appuser:appuser kesaseteli/requirements.txt /app/requirements.txt
COPY --chown=appuser:appuser kesaseteli/requirements-prod.txt /app/requirements-prod.txt
COPY --chown=appuser:appuser kesaseteli/.prod/escape_json.c /app/.prod/escape_json.c
COPY --chown=appuser:appuser shared /shared/

RUN apt-install.sh \
        git \
        netcat \
        libpq-dev \
        build-essential \
        gettext \
    && pip install -U pip \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir  -r /app/requirements-prod.txt \
    && uwsgi --build-plugin /app/.prod/escape_json.c \
    && mv /app/escape_json_plugin.so /app/.prod/escape_json_plugin.so \
    && apt-cleanup.sh build-essential

COPY --chown=appuser:appuser kesaseteli/docker-entrypoint.sh /entrypoint/docker-entrypoint.sh
ENTRYPOINT ["/entrypoint/docker-entrypoint.sh"]

COPY --chown=appuser:appuser kesaseteli/media/ /var/media/

# ==============================
FROM appbase as development
# ==============================

COPY --chown=appuser:appuser kesaseteli/requirements-dev.txt /app/requirements-dev.txt
RUN apt-install.sh \
        build-essential \
    && pip install --no-cache-dir -r /app/requirements-dev.txt \
    && apt-cleanup.sh build-essential

ENV DEV_SERVER=1

COPY --chown=appuser:appuser /kesaseteli/ /app/

USER appuser
EXPOSE 8000/tcp

# ==============================
FROM appbase as production
# ==============================

COPY --chown=appuser:appuser /kesaseteli/ /app/

RUN SECRET_KEY="only-used-for-collectstatic" python manage.py collectstatic

USER appuser
EXPOSE 8000/tcp
