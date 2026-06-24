# =======================================
FROM registry.access.redhat.com/ubi9/nodejs-24 AS distbase
# =======================================

USER root

# Install ca-certificates so that Sentry can upload source maps
RUN yum update -y && yum install -y ca-certificates && yum clean all

# Install pnpm
RUN npm install -g pnpm@11.5.0

# =============================
FROM distbase AS appbase
# =============================

USER root

# Build ARGS
ARG PROJECT
ARG FOLDER

WORKDIR /app

# Install dependencies
COPY --chown=default:root package.json pnpm-lock.yaml pnpm-workspace.yaml lerna.json ./
COPY --chown=default:root $PROJECT/$FOLDER/package.json $PROJECT/$FOLDER/package.json
COPY --chown=default:root $PROJECT/shared/package.json* $PROJECT/shared/package.json
COPY --chown=default:root shared/package.json shared/package.json
RUN --mount=type=cache,target=/pnpm/store,sharing=locked pnpm install --store-dir /pnpm/store --frozen-lockfile

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
ARG NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
ARG NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS
ARG NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
ARG NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE
ARG NEXT_PUBLIC_CSP_REPORT_URI
ARG NEXT_PUBLIC_CSP_POLICY
ARG NEXT_PUBLIC_SENTRY_DEBUG
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
ARG NEXT_PUBLIC_RELEASE
ARG NEXT_PUBLIC_ASKEM_API_KEY
ARG NEXT_PUBLIC_SHOW_COOKIE_BANNER
ARG NEXT_PUBLIC_ENABLE_ALTERATION_FEATURES
ARG NEXT_PUBLIC_MATOMO_URL
ARG NEXT_PUBLIC_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE
ARG NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE
ARG NEXT_PUBLIC_MATOMO_ENABLED

USER default:root
WORKDIR /app

# copy all files
COPY --chown=default:root . .

# Build application
WORKDIR /app/$PROJECT/$FOLDER/

RUN pnpm build

# ==========================================
FROM appbase AS production
# ==========================================

ARG PORT
ARG PROJECT
ARG FOLDER
ARG NEXT_PUBLIC_RELEASE
ENV NEXT_PUBLIC_RELEASE=$NEXT_PUBLIC_RELEASE

WORKDIR /app

USER root

RUN rm -rf $PROJECT/$FOLDER/node_modules \
    $PROJECT/shared/node_modules \
    $PROJECT/node_modules \
    shared/node_modules \
    node_modules

# Install production dependencies
RUN --mount=type=cache,target=/pnpm/store,sharing=locked pnpm install --store-dir /pnpm/store --prod --frozen-lockfile --ignore-scripts --prefer-offline

# Change ownership to default:root to ensure accessibility
RUN chown -R default:root /app

USER default:root

# Copy files needed by nextjs
COPY --chown=default:root --from=staticbuilder app/$PROJECT/$FOLDER/.next $PROJECT/$FOLDER/.next
COPY --chown=default:root --from=staticbuilder app/$PROJECT/$FOLDER/next-i18next.config.js app/$PROJECT/$FOLDER/next.config.js $PROJECT/$FOLDER/
COPY --chown=default:root --from=staticbuilder app/next.config.js ./
COPY --chown=default:root --from=staticbuilder app/shared/src/server/next-server.js shared/src/server/

# Copy public directory
COPY --chown=default:root --from=staticbuilder app/$PROJECT/$FOLDER/public $PROJECT/$FOLDER/public

ENV NEXT_TELEMETRY_DISABLED 1

# Expose port
EXPOSE $PORT

# Start nextjs server
ENV PROD_START "pnpm --dir $PROJECT/$FOLDER start"
CMD ["sh", "-c", "${PROD_START}"]
