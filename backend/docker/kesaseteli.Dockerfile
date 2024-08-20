# ==============================
FROM registry.access.redhat.com/ubi9/python-39 AS appbase
# ==============================

USER root
WORKDIR /app

RUN mkdir /entrypoint

COPY --chown=default:root kesaseteli/requirements.txt /app/requirements.txt
COPY --chown=default:root kesaseteli/requirements-prod.txt /app/requirements-prod.txt
COPY --chown=default:root kesaseteli/.prod/escape_json.c /app/.prod/escape_json.c
COPY --chown=default:root shared /shared/

RUN dnf update -y \
    && dnf install -y \
           git \
           nc \
           postgresql-devel \
           gcc \
           gettext \
           xmlsec1 \
           xmlsec1-openssl \
           cyrus-sasl-devel \
           openssl-devel \
    && pip install -U pip \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir -r /app/requirements-prod.txt \
    && uwsgi --build-plugin /app/.prod/escape_json.c \
    && mv /app/escape_json_plugin.so /app/.prod/escape_json_plugin.so \
    && dnf remove -y gcc cyrus-sasl-devel openssl-devel \
    && dnf clean all

COPY --chown=default:root kesaseteli/docker-entrypoint.sh /entrypoint/docker-entrypoint.sh
ENTRYPOINT ["/entrypoint/docker-entrypoint.sh"]

COPY --chown=default:root kesaseteli/media/ /var/media/

# ==============================
FROM appbase AS development
# ==============================

COPY --chown=default:root kesaseteli/requirements-dev.txt /app/requirements-dev.txt
RUN dnf install -y gcc --allowerasing \
    && pip install --no-cache-dir -r /app/requirements-dev.txt \
    && dnf remove -y gcc \
    && dnf clean all

ENV DEV_SERVER=1

COPY --chown=default:root /kesaseteli/ /app/

# Mark the app directory as safe to get rid of git's
# "fatal: detected dubious ownership in repository at '/app'" warning
# when spinning up the container
RUN git config --system --add safe.directory /app

USER default

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp

# ==============================
FROM appbase AS production
# ==============================

COPY --chown=default:root /kesaseteli/ /app/

# Mark the app directory as safe to get rid of git's
# "fatal: detected dubious ownership in repository at '/app'" warning
# when spinning up the container
RUN git config --system --add safe.directory /app

RUN SECRET_KEY="only-used-for-collectstatic" python manage.py collectstatic

USER default

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp
