# =======================================
FROM registry.access.redhat.com/ubi9/nodejs-18 AS distbase
# =======================================

USER root

# Install ca-certificates so that Sentry can upload source maps
RUN yum update -y && yum install -y ca-certificates && yum clean all

# Install yarn
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

# =============================
FROM distbase AS appbase
# =============================

USER root

# Build ARGS
ARG PROJECT
ARG FOLDER

# Yarn
ENV YARN_VERSION 1.22.10
RUN yarn policies set-version "$YARN_VERSION" && \
    yarn config set ignore-engines true

WORKDIR /app

# Install dependencies
COPY --chown=default:root package.json yarn.lock lerna.json ./
COPY --chown=default:root $PROJECT/$FOLDER/package.json $PROJECT/$FOLDER/package.json
COPY --chown=default:root $PROJECT/shared/package.json* $PROJECT/shared/package.json
COPY --chown=default:root shared/package.json shared/package.json
RUN --mount=type=cache,target=/app/.yarn_cache,sharing=locked YARN_CACHE_FOLDER=/app/.yarn_cache yarn --frozen-lockfile --check-files --network-timeout 600000

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
ARG NEXT_PUBLIC_ENABLE_ALTERATION_FEATURES

USER default:root
WORKDIR /app

# copy all files
COPY --chown=default:root . .

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

# Install production dependencies
RUN --mount=type=cache,target=/app/.yarn_cache,sharing=locked YARN_CACHE_FOLDER=/app/.yarn_cache yarn install --production --check-files --ignore-scripts --prefer-offline && yarn cache clean --force

# Change ownership to default:root to ensure accessibility
RUN chown -R default:root /app

USER default:root

# Copy files needed by nextjs
COPY --chown=default:root --from=staticbuilder app/$PROJECT/$FOLDER/.next $PROJECT/$FOLDER/.next
COPY --chown=default:root --from=staticbuilder app/$PROJECT/$FOLDER/next-i18next.config.js app/$PROJECT/$FOLDER/next.config.js $PROJECT/$FOLDER/
COPY --chown=default:root --from=staticbuilder app/next.config.js ./
COPY --chown=default:root --from=staticbuilder app/shared/src/server/next-server.js shared/src/server/

# Copy public directory
COPY --chown=default:root $PROJECT/$FOLDER/public $PROJECT/$FOLDER/public

ENV NEXT_TELEMETRY_DISABLED 1

# Expose port
EXPOSE $PORT

# Start nextjs server
ENV PROD_START "yarn --cwd $PROJECT/$FOLDER start"
CMD ["sh", "-c", "${PROD_START}"]
