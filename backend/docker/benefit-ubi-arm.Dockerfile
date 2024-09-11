# ==============================
FROM registry.access.redhat.com/ubi9/python-39 AS appbase
# ==============================
ARG SENTRY_RELEASE

USER root
WORKDIR /app

RUN mkdir /entrypoint

COPY --chown=default:root benefit/requirements.txt /app/requirements.txt
COPY --chown=default:root benefit/requirements-prod.txt /app/requirements-prod.txt
COPY --chown=default:root benefit/.prod/escape_json.c /app/.prod/escape_json.c
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
    && dnf remove -y gcc cyrus-sasl-devel openssl-devel

# Install wkhtmltopdf and it's deps from CentOS9 repo and binary
COPY --chown=default:root docker/ubi/centos9-aarch.repo /etc/yum.repos.d/centos9.repo
RUN rpm --import https://www.centos.org/keys/RPM-GPG-KEY-CentOS-Official \
    && dnf install -y xorg-x11-server-Xvfb compat-openssl11 \
    && wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox-0.12.6.1-3.almalinux8.aarch64.rpm \
    && dnf localinstall -y wkhtmltox-0.12.6.1-3.almalinux8.aarch64.rpm \
    && rm -f /etc/yum.repos.d/centos9.repo && rm -f wkhtmltox-0.12.6.1-3.almalinux8.aarch64.rpm && dnf clean all

COPY --chown=default:root /benefit/ /app/
# Mark the app directory as safe to get rid of git's
# "fatal: detected dubious ownership in repository at '/app'" warning
# when spinning up the container
RUN git config --system --add safe.directory /app

COPY --chown=default:root benefit/docker-entrypoint.sh /entrypoint/docker-entrypoint.sh
ENTRYPOINT ["/entrypoint/docker-entrypoint.sh"]


# ==============================
FROM appbase AS development
# ==============================

COPY --chown=default:root benefit/requirements-dev.txt /app/requirements-dev.txt
RUN dnf install -y gcc --allowerasing \
    && pip install --no-cache-dir -r /app/requirements-dev.txt \
    && dnf remove -y gcc \
    && dnf clean all

ENV DEV_SERVER=1

USER default

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp

# ==============================
FROM appbase AS production
# ==============================
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE

RUN SECRET_KEY="only-used-for-collectstatic" python manage.py collectstatic

USER default

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp
