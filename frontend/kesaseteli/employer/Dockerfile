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
COPY --chown=appuser:appuser kesaseteli/employer/package.json kesaseteli/employer/package.json
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
CMD ["yarn", "dev"]

# ===================================
FROM appbase as staticbuilder
# ===================================
# Set environmental variables for frontend (used in CI)
ARG NEXT_PUBLIC_BACKEND_URL

# Use non-root user
USER appuser
WORKDIR /app

# copy all files
COPY --chown=appuser:appuser . .

# Build application
RUN yarn build

# ==========================================
FROM helsinkitest/node:14-slim AS production
# ==========================================

# Use non-root user
USER appuser

WORKDIR /app

# Copy build folder from stage 1
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/employer/.next kesaseteli/employer/.next


# Copy next.js config
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/employer/next.config.js kesaseteli/employer/

# Copy package.json and yarn.lock files
# TODO: add public folder when we have static assets
COPY --from=staticbuilder --chown=appuser:appuser app/package.json app/yarn.lock app/lerna.json ./
COPY --from=staticbuilder --chown=appuser:appuser app/kesaseteli/employer/package.json app/kesaseteli/employer/start.js kesaseteli/employer/


# shared data
COPY --from=staticbuilder --chown=appuser:appuser app/shared/package.json shared/
COPY --from=staticbuilder --chown=appuser:appuser app/shared/src/server/next-server.js shared/src/server/


# Install production dependencies
RUN yarn install --production --frozen-lockfile --check-files

# Sets the directory and file permissions to allow users in the root group to access them in the built image (for OpenShift)
# https://docs.openshift.com/enterprise/3.2/creating_images/guidelines.html
RUN chgrp -R 0 ./package.json ./yarn.lock ./lerna.json shared/package.json shared/src ./node_modules && \
    chmod -R g+rwX ./package.json ./yarn.lock ./lerna.json shared/package.json shared/src ./node_modules


# Expose port
EXPOSE 3000

# install lerna
RUN yarn global add lerna

# Start nextjs server
# https://github.com/lerna/lerna/issues/2428
CMD ["yarn", "start:employer"]
