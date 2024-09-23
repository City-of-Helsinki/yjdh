# ==============================
FROM registry.access.redhat.com/ubi9/python-39 AS appbase
# ==============================
USER root
WORKDIR /app

RUN mkdir /entrypoint

COPY --chown=default:root tet/requirements.txt /app/requirements.txt
COPY --chown=default:root tet/requirements-prod.txt /app/requirements-prod.txt
COPY --chown=default:root tet/.prod/escape_json.c /app/.prod/escape_json.c
COPY --chown=default:root shared /shared/

RUN dnf --disableplugin subscription-manager update -y \
    && dnf --disableplugin subscription-manager install -y \
       nmap-ncat \
       postgresql-devel \
    && pip install -U pip setuptools wheel \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir -r /app/requirements-prod.txt \
    && uwsgi --build-plugin /app/.prod/escape_json.c \
    && mv /app/escape_json_plugin.so /app/.prod/escape_json_plugin.so \
    && dnf --disableplugin subscription-manager clean all

COPY --chown=default:root tet/docker-entrypoint.sh /entrypoint/docker-entrypoint.sh
ENTRYPOINT ["/entrypoint/docker-entrypoint.sh"]
COPY --chown=default:root tet /app/

EXPOSE 8000/tcp

# ==============================
FROM appbase AS development
# ==============================

COPY --chown=default:root tet/requirements-dev.txt /app/requirements-dev.txt
RUN pip install --no-cache-dir -r /app/requirements-dev.txt

ENV DEV_SERVER=1

USER default

# ==============================
FROM appbase AS production
# ==============================

USER default
