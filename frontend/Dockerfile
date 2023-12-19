# =======================================
FROM helsinkitest/node:18-slim AS distbase
# =======================================

# Install ca-certificates so that Sentry can upload source maps
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && apt-get clean

# =============================
FROM distbase AS appbase
# =============================

# Build ARGS
ARG PROJECT
ARG FOLDER

# Yarn
ENV YARN_VERSION 1.22.10
RUN yarn policies set-version "$YARN_VERSION" && \
    yarn config set ignore-engines true

WORKDIR /app

# Install dependencies
COPY --chown=appuser:0 package.json yarn.lock lerna.json ./
COPY --chown=appuser:0 $PROJECT/$FOLDER/package.json $PROJECT/$FOLDER/package.json
COPY --chown=appuser:0 $PROJECT/shared/package.json* $PROJECT/shared/package.json
COPY --chown=appuser:0 shared/package.json shared/package.json
RUN YARN_CACHE_FOLDER=/app/.yarn_cache yarn --frozen-lockfile --check-files --network-timeout 600000

# ===================================
FROM appbase AS staticbuilder
# ===================================

# Set environmental variables for frontend (used in CI)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_ACTIVATION_LINK_EXPIRATION_SECONDS
ARG NEXT_PUBLIC_MOCK_FLAG
ARG NEXT_PUBLIC_ENABLE_SUOMIFI
ARG NEXT_PUBLIC_DISABLE_VTJ
ARG NEXTJS_DISABLE_SENTRY
ARG NEXTJS_SENTRY_UPLOAD_DRY_RUN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_DEDBUG
ARG NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE
ARG NEXTJS_SENTRY_TRACING
ARG NEXT_PUBLIC_LINKEDEVENTS_URL
ARG NEXT_PUBLIC_KEYWORDS_DATA_SOURCE
ARG NEXT_SHARP_PATH
ARG PROJECT
ARG FOLDER
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_URL
ARG SENTRY_RELEASE
ARG NEXT_PUBLIC_ASKEM_API_KEY
ARG NEXT_PUBLIC_SHOW_COOKIE_BANNER

USER appuser:0
WORKDIR /app

# copy all files
COPY --chown=appuser:0 . .

# Build application
WORKDIR /app/$PROJECT/$FOLDER/

RUN yarn build

# ==========================================
FROM appbase AS production
# ==========================================

ARG PORT
ARG PROJECT
ARG FOLDER
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE

WORKDIR /app

USER root

RUN rm -rf $PROJECT/$FOLDER/node_modules \
           $PROJECT/shared/node_modules \
           $PROJECT/node_modules \
           shared/node_modules \
           node_modules
           
USER appuser:0

# Install production dependencies           
RUN YARN_CACHE_FOLDER=/app/.yarn_cache yarn install --production --check-files --ignore-scripts --prefer-offline && yarn cache clean --force

# Copy files needed by nextjs
COPY --chown=appuser:0 --from=staticbuilder app/$PROJECT/$FOLDER/.next $PROJECT/$FOLDER/.next
COPY --chown=appuser:0 --from=staticbuilder app/$PROJECT/$FOLDER/next-i18next.config.js app/$PROJECT/$FOLDER/next.config.js $PROJECT/$FOLDER/
COPY --chown=appuser:0 --from=staticbuilder app/next.config.js ./
COPY --chown=appuser:0 --from=staticbuilder app/shared/src/server/next-server.js shared/src/server/

# Copy public directory
COPY --chown=appuser:0 $PROJECT/$FOLDER/public $PROJECT/$FOLDER/public

ENV NEXT_TELEMETRY_DISABLED 1

# Expose port
EXPOSE $PORT

# Start nextjs server
ENV PROD_START "yarn --cwd $PROJECT/$FOLDER start"
CMD ["sh", "-c", "${PROD_START}"]
