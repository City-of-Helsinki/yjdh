# ==============================
FROM registry.access.redhat.com/ubi9/python-312 AS appbase
# ==============================

USER root
WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.12.13@sha256:b485bd65cc2cf1c9a93b3554012c9c3778cf7b1b5fd3d3096ce9e1226c97e1e6 /uv /uvx /usr/local/bin/

ENV UV_PROJECT_ENVIRONMENT=/opt/app-root \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_CACHE=1 \
    UV_PYTHON_DOWNLOADS=never

RUN mkdir /entrypoint

COPY --chown=root:root --chmod=644 kesaseteli/pyproject.toml kesaseteli/uv.lock /app/
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
    && uv sync --locked --no-dev --group prod \
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

RUN dnf install -y gcc --allowerasing \
    && uv sync --locked --group prod \
    && dnf remove -y gcc \
    && dnf clean all

ENV DEV_SERVER=1

COPY --chown=default:root /kesaseteli/ /app/
COPY --chown=root:root --chmod=644 kesaseteli/pyproject.toml kesaseteli/uv.lock /app/
RUN chown root:root /app && chmod 755 /app

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
COPY --chown=root:root --chmod=644 kesaseteli/pyproject.toml kesaseteli/uv.lock /app/
RUN chown root:root /app && chmod 755 /app

# Mark the app directory as safe to get rid of git's
# "fatal: detected dubious ownership in repository at '/app'" warning
# when spinning up the container
RUN git config --system --add safe.directory /app

RUN SECRET_KEY="only-used-for-collectstatic" \
    ENCRYPTION_KEY="only-used-for-collectstatic" \
    SOCIAL_SECURITY_NUMBER_HASH_KEY="only-used-for-collectstatic" \
    python manage.py collectstatic

USER default

# Compile messages as a part of Docker image build so it doesn't have to be done during
# container startup. This removes the need for writeable localization directories.
RUN django-admin compilemessages

EXPOSE 8000/tcp
