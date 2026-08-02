const { withSentryConfig } = require('@sentry/nextjs');
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
const pc = require('picocolors');
const packageJson = require('./package.json');
const fs = require('fs');
const path = require('path');

const trueEnv = ['true', '1', 'yes'];

// Get the app context ...
let appName;
if (process.cwd().indexOf('/app/') === 0) {
  // ... from docker system
  appName = process.cwd().split('/app/').pop();
} else if (process.cwd().includes('/frontend/')) {
  // ... from local system
  appName = process.cwd().split('/frontend/').pop();
}

// Copy pdfjs worker to public/ at config-load time so Turbopack can serve it as a static file.
// This must be at module level — the webpack() callback is never called by Turbopack.
if (appName && appName === 'benefit/applicant') {
  try {
    const pdfjsPkg = require.resolve('pdfjs-dist/package.json');
    const workerSrc = path.join(path.dirname(pdfjsPkg), 'build', 'pdf.worker.min.mjs');
    const publicDir = path.join(process.cwd(), 'public');
    const workerDest = path.join(publicDir, 'pdf.worker.min.mjs');
    fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(workerSrc, workerDest);
  } catch (e) {
    console.warn('Could not copy pdfjs worker to public/:', e.message);
  }
}

const nextConfig = ({ env: envOverrides, ...restOverrides }) => {
  // Reserved runtime-only variables that must never be inlined into bundles via
  // Next.js `env` / webpack DefinePlugin. For example `DEBUG` is a runtime toggle
  // for the `debug` logging library; inlining it rewrites `process.env.DEBUG = ...`
  // inside bundled packages into invalid assignments like `"1" = ...`.
  const RESERVED_ENV_KEYS = new Set(['DEBUG']);
  const safeEnvOverrides = Object.fromEntries(
    Object.entries(envOverrides ?? {}).filter(([key]) => !RESERVED_ENV_KEYS.has(key)),
  );

  const NEXTJS_IGNORE_ESLINT = trueEnv.includes(process.env?.NEXTJS_IGNORE_ESLINT ?? 'false');
  const NEXTJS_IGNORE_TYPECHECK = trueEnv.includes(process.env?.NEXTJS_IGNORE_TYPECHECK ?? 'false');
  const NEXTJS_DISABLE_SENTRY = trueEnv.includes(process.env?.NEXTJS_DISABLE_SENTRY ?? 'false');
  const NEXTJS_SENTRY_UPLOAD_DRY_RUN = trueEnv.includes(process.env?.NEXTJS_SENTRY_UPLOAD_DRY_RUN ?? 'false');
  const NEXTJS_SENTRY_DEBUG = trueEnv.includes(process.env?.NEXTJS_SENTRY_DEBUG ?? 'false');
  const NEXTJS_SENTRY_TRACING = trueEnv.includes(process.env?.NEXTJS_SENTRY_TRACING ?? 'false');
  const WATCHPACK_POLLING = trueEnv.includes(process.env?.WATCHPACK_POLLING ?? 'false');

  // See https://nextjs.org/docs/advanced-features/source-maps
  const disableSourceMaps = trueEnv.includes(process.env?.NEXT_DISABLE_SOURCEMAPS ?? 'false');

  if (disableSourceMaps) {
    console.warn(`${pc.yellow('notice')}- Sourcemaps generation have been disabled through NEXT_DISABLE_SOURCEMAPS`);
  }

  if (NEXTJS_SENTRY_DEBUG) {
    console.warn(`${pc.yellow('notice')}- Build won't use sentry treeshaking (NEXTJS_SENTRY_DEBUG)`);
  }

  const config = {
    productionBrowserSourceMaps: !disableSourceMaps,
    poweredByHeader: false,
    // Disable the dev static/build indicator. Its HMR `isrManifest` handler in
    // next@15.5 throws "Cannot read properties of undefined (reading 'components')"
    // when it runs before window.next.router is ready, polluting the browser-test
    // console. The indicator is a cosmetic dev-only badge with no app impact.
    devIndicators: false,
    compiler: {
      styledComponents: true,
    },
    output: 'standalone',
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
    typescript: {
      /** Do not run TypeScript during production builds (`next build`). */
      ignoreBuildErrors: NEXTJS_IGNORE_TYPECHECK,
    },
    eslint: {
      ignoreDuringBuilds: NEXTJS_IGNORE_ESLINT,
    },
    transpilePackages: ['@frontend', 'uuid'],
    experimental: {
      // Allow CJS packages (e.g. hds-react) to require ESM-only packages such as
      // `uuid`. With pnpm's strict resolution these packages resolve to their ESM
      // builds, which Next.js otherwise refuses to import from CJS by default.
      esmExternals: 'loose',
    },
    webpack: (config, { webpack, isServer }) => {
      config.resolve.fallback = {
        fs: false,
      };

      // Force a single styled-components instance across the app, shared packages
      // and hds-react. Under pnpm's symlinked layout, optional peer variations
      // (e.g. supports-color pulled by debug/@babel/core) split styled-components
      // into multiple physical copies of the same version. Multiple instances mean
      // the ThemeProvider from one copy can't supply the theme to styled components
      // from another, causing SSR failures like `Cannot read properties of
      // undefined (reading 'm')` when reading `theme.spacing.m`. Aliasing pins every
      // import to one resolved copy.
      config.resolve.alias = {
        ...config.resolve.alias,
        'styled-components': path.dirname(require.resolve('styled-components/package.json')),
      };

      // Keep next-i18next's serverSideTranslations external in the server build so
      // it runs as real Node code. It performs a hidden dynamic
      // `require('./next-i18next.config.js')`; when bundled (which happens under
      // pnpm's symlinked layout) that require is handled by webpack and fails with
      // MODULE_NOT_FOUND at prerender time. As an external it uses Node's require,
      // so each app's own next-i18next.config.js resolves correctly at runtime.
      // Only the SSR config loader is externalized; the React integration
      // (appWithTranslation / useTranslation) stays bundled to avoid duplicate
      // module instances.
      if (isServer) {
        const existing = config.externals ?? [];
        const existingList = Array.isArray(existing) ? existing : [existing];
        config.externals = [
          ...existingList.filter(Boolean),
          ({ request }, callback) => {
            if (request === 'next-i18next/serverSideTranslations') {
              return callback(null, `commonjs ${request}`);
            }
            return callback();
          },
        ];
      }

      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /\/(__tests__|test)\// }));

      // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/
      config.plugins.push(
        new webpack.DefinePlugin({
          __SENTRY_DEBUG__: NEXTJS_SENTRY_DEBUG,
          __SENTRY_TRACING__: NEXTJS_SENTRY_TRACING,
        }),
      );

      config.module.rules.push({
        test: /\.test.tsx$/,
        loader: 'ignore-loader',
      });

      // Enable file watching using polling if WATCHPACK_POLLING is enabled.
      // This makes hot reload work in Docker on e.g. Windows using data on
      // host filesystem. NOTE: Enabling Turbopack makes this not work!
      if (WATCHPACK_POLLING) {
        config.watchOptions = {
          ...config.watchOptions,
          // https://webpack.js.org/configuration/watch/#watchoptions
          poll: 1000, // Check for changes every second
          aggregateTimeout: 300, // Delay 0.3s before rebuilding to group changes
          ignored: ['**/node_modules', '**/.git', '**/.next'],
        };
        console.info('Polling enabled for webpack file watching');
      } else {
        console.info('Using native file watching for webpack');
      }

      return config;
    },
    env: {
      APP_NAME: packageJson.name,
      NEXT_PUBLIC_APP_NAME: appName,
      APP_VERSION: packageJson.version,
      BUILD_TIME: new Date().toISOString(),
      ...safeEnvOverrides,
    },
    serverRuntimeConfig: {
      // to bypass https://github.com/zeit/next.js/issues/8251
      PROJECT_ROOT: __dirname,
    },
    ...restOverrides,
  };

  const cloudSentryEnabled =
    process.env?.NEXT_PUBLIC_SENTRY_ENVIRONMENT &&
    process.env?.NEXT_PUBLIC_SENTRY_DSN &&
    process.env?.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE &&
    process.env?.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS &&
    process.env?.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE !== undefined &&
    process.env?.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE !== undefined;

  if (cloudSentryEnabled) {
    console.warn(`${pc.yellow('notice')}- Cloud Sentry variables detected:`, {
      SENTRY_ENVIRONMENT: process.env?.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
      SENTRY_DSN: process.env?.NEXT_PUBLIC_SENTRY_DSN ? 'SET' : 'NOT SET',
      SENTRY_TRACES_SAMPLE_RATE: process.env?.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      SENTRY_TRACE_PROPAGATION_TARGETS: process.env?.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS,
      SENTRY_REPLAYS_SESSION_SAMPLE_RATE: process.env?.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: process.env?.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    });
  }

  if (!NEXTJS_DISABLE_SENTRY) {
    console.warn(`${pc.yellow('notice')}- Sentry is enabled (NEXTJS_DISABLE_SENTRY)`);
    // @ts-ignore because sentry does not match nextjs current definitions
    return withSentryConfig(config, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options
      ...(cloudSentryEnabled
        ? {
            // Only print logs for uploading source maps in CI
            silent: !process.env.CI,
            // Disable sourcemap uploading to Sentry
            sourcemaps: {
              disable: true,
            },
            // Automatically tree-shake Sentry logger statements to reduce bundle size
            disableLogger: true,
            reactComponentAnnotation: {
              enabled: true,
            },
          }
        : {
            dryRun: NEXTJS_SENTRY_UPLOAD_DRY_RUN,
            disableLogger: !NEXTJS_SENTRY_DEBUG,
          }),
    });
  } else {
    console.warn(`${pc.yellow('notice')}- Sentry is disabled (NEXTJS_DISABLE_SENTRY)`);
  }

  return config;
};

module.exports = nextConfig;
