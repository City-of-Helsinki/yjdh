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
COPY --chown=appuser:appuser employer/package.json employer/package.json
COPY --chown=appuser:appuser shared/package.json shared/package.json


RUN yarn --frozen-lockfile && yarn cache clean --force

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
CMD ["yarn", "dev"]

# ===================================
FROM appbase as staticbuilder
# ===================================
# Set environmental variables (when building image on GitLab CI)
# specified in gitlab-ci.yml file
ARG NEXT_PUBLIC_API_BASE_URL

# Use non-root user
USER appuser
WORKDIR /app

# copy all files
COPY --from=development --chown=appuser:appuser app/ .

# Build application
RUN yarn build

# ==========================================
FROM helsinkitest/node:12-slim AS production
# ==========================================

# Use non-root user
USER appuser

WORKDIR /app

# Copy build folder from stage 1
COPY --from=staticbuilder --chown=appuser:appuser app/employer/.next employer/.next

# Copy next.js config
COPY --from=staticbuilder --chown=appuser:appuser app/employer/next.config.js employer/

# Copy package.json and yarn.lock files
# TODO: add public folder when we have static assets
COPY --from=staticbuilder --chown=appuser:appuser app/package.json app/yarn.lock app/lerna.json ./
COPY --from=staticbuilder --chown=appuser:appuser app/employer/package.json employer/

# shared data
COPY --from=staticbuilder --chown=appuser:appuser app/shared/package.json shared/

# Install production dependencies
RUN yarn install --production

# Expose port
EXPOSE $EMPLOYER_PORT

# install lerna
RUN yarn global add lerna

# Start nextjs server
CMD ["yarn", "start"]
