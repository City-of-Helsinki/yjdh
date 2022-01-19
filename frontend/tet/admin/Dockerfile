# =======================================
FROM helsinkitest/node:14-slim as appbase
# =======================================

# Use non-root user
USER appuser

# Yarn
ENV YARN_VERSION 1.22.10
RUN yarn policies set-version $YARN_VERSION
RUN yarn config set ignore-engines true

WORKDIR /app

# Install dependencies
COPY --chown=appuser:appuser package.json yarn.lock lerna.json ./
COPY --chown=appuser:appuser tet/admin/package.json tet/admin/package.json
COPY --chown=appuser:appuser shared/package.json shared/package.json

RUN yarn --frozen-lockfile --check-files && yarn cache clean --force

# Copy all files
COPY --chown=appuser:appuser . .

# =============================
FROM appbase as development
# =============================

ENV NODE_OPTIONS="--max_old_space_size=8192"

# Use non-root user
USER appuser
WORKDIR /app

# Copy all files
COPY --chown=appuser:appuser . .
# Bake package.json start command into the image
CMD ["yarn", "te-admn:dev"]

# ===================================
FROM appbase as staticbuilder
# ===================================
# Set environmental variables for frontend (used in CI)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_MOCK_FLAG
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT

# Use non-root user
USER appuser
WORKDIR /app

# copy all files
COPY --chown=appuser:appuser . .

# Build application
WORKDIR /app/tet/admin/
RUN yarn build

# Clean all dependencies (this should avoid caching + missing /pages directory problem)
RUN rm -rf node_modules
RUN yarn cache clean

# ==========================================
FROM helsinkitest/node:14-slim AS production
# ==========================================

# Use non-root user
USER appuser

WORKDIR /app

# Copy build folder from stage 1
COPY --from=staticbuilder --chown=appuser:appuser app/tet/admin/.next tet/admin/.next

# Copy next.js config
COPY --from=staticbuilder --chown=appuser:appuser app/tet/admin/next-i18next.config.js app/tet/admin/next.config.js tet/admin/

# Copy package.json and yarn.lock files
COPY --from=staticbuilder --chown=appuser:appuser app/tet/admin/public app/package.json app/yarn.lock app/lerna.json ./
COPY --from=staticbuilder --chown=appuser:appuser app/tet/admin/package.json app/tet/admin/start.js tet/admin/

# shared data
COPY --from=staticbuilder --chown=appuser:appuser app/shared/package.json shared/
COPY --from=staticbuilder --chown=appuser:appuser app/shared/src/server/next-server.js shared/src/server/

# Install production dependencies
RUN yarn install --production --frozen-lockfile --check-files

# install lerna
RUN yarn add -W lerna

USER root
# Use non-root user and add it to the root group (0)
RUN usermod -a -G 0 appuser
# Sets the directory and file permissions to allow users in the root group to access them in the built image (for OpenShift)
# https://docs.openshift.com/enterprise/3.2/creating_images/guidelines.html
RUN chgrp -R 0 . \
  && chmod -R g+rwX .
USER appuser

# Expose port
EXPOSE 3000

# Start nextjs server
# https://github.com/lerna/lerna/issues/2428
CMD ["yarn", "te-admn:start"]
