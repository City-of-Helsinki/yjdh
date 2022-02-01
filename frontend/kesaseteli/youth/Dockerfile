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
COPY --chown=appuser:appuser kesaseteli/youth/package.json kesaseteli/youth/package.json
COPY --chown=appuser:appuser kesaseteli/shared/package.json kesaseteli/shared/package.json
COPY --chown=appuser:appuser shared/package.json shared/package.json

RUN yarn --frozen-lockfile --check-files && yarn cache clean --force

# Copy all files
COPY --chown=appuser:appuser . .

# =============================
FROM appbase as development
# =============================

# Use non-root user
USER appuser
WORKDIR /app

# Copy all files
COPY --chown=appuser:appuser . .
# Bake package.json start command into the image
CMD ["yarn", "ks-youth:dev"]

# ===================================
FROM appbase as staticbuilder
# ===================================
# Set environmental variables for frontend (used in CI)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS
ARG NEXT_PUBLIC_MOCK_FLAG
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT

# Use non-root user
USER appuser
WORKDIR /app

# copy all files
COPY --chown=appuser:appuser . .

# Build application
WORKDIR /app/kesaseteli/youth/
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
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/youth/.next kesaseteli/youth/.next

# Copy next.js config
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/youth/next-i18next.config.js app/kesaseteli/youth/next.config.js kesaseteli/youth/

# Copy package.json and yarn.lock files
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/youth/public app/package.json app/yarn.lock app/lerna.json ./
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/youth/package.json app/kesaseteli/youth/start.js kesaseteli/youth/

# shared data
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/shared/package.json kesaseteli/shared/
COPY --from=staticbuilder --chown=appuser:appuser app/shared/package.json shared/
COPY --from=staticbuilder --chown=appuser:appuser app/shared/src/server/next-server.js shared/src/server/

# Install production dependencies
RUN yarn install --production --frozen-lockfile --check-files

# install lerna
RUN yarn add -W lerna

# Expose port
EXPOSE 3100

# Start nextjs server
# https://github.com/lerna/lerna/issues/2428
CMD ["yarn", "ks-youth:start"]
