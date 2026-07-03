/* eslint-disable unicorn/prefer-module */
const fontOrigins = ['https://makasiini.hel.fi', 'https://makasiini.hel.ninja'];

/**
 * Extract the origin from a URL string for CSP allowlists.
 * Returns null when the value is missing or not a valid URL.
 */
const getOriginFromUrl = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

/**
 * Build the Content-Security-Policy header value for Kesäseteli apps.
 * Connect and analytics allowances come from public env vars.
 * Development builds also allow unsafe-eval for Next.js hot reload.
 */
const buildKesaseteliCspPolicy = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const matomoOrigins = [
    getOriginFromUrl(process.env.NEXT_PUBLIC_MATOMO_URL),
  ].filter(Boolean);
  const matomoSources =
    matomoOrigins.length > 0 ? ` ${matomoOrigins.join(' ')}` : '';
  const connectOrigins = [
    "'self'",
    getOriginFromUrl(process.env.NEXT_PUBLIC_BACKEND_URL),
    getOriginFromUrl(process.env.NEXT_PUBLIC_SENTRY_DSN),
    ...matomoOrigins,
  ].filter(Boolean);

  return [
    "default-src 'self'",
    `script-src 'self'${isDev ? " 'unsafe-eval'" : ''}${matomoSources}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data:${matomoSources}`,
    `font-src 'self' data: ${fontOrigins.join(' ')}`,
    `connect-src ${connectOrigins.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
};

const PERMISSIONS_POLICY =
  'camera=(), microphone=(), geolocation=(), payment=(), usb=()';

/**
 * Build response headers applied to all Kesäseteli frontend routes.
 */
const buildKesaseteliSecurityHeaders = () => [
  {
    key: 'Content-Security-Policy',
    value: buildKesaseteliCspPolicy(),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: PERMISSIONS_POLICY,
  },
];

/**
 * Wrap a Next.js config to send Kesäseteli security headers on all routes.
 * @param {object} config Existing Next.js configuration object.
 * @returns {object} Config with a headers() function that sets security headers.
 */
const withKesaseteliSecurityHeaders = (config) => ({
  ...config,
  async headers() {
    const existing = (await config.headers?.()) ?? [];

    return [
      ...existing,
      {
        source: '/:path*',
        headers: buildKesaseteliSecurityHeaders(),
      },
    ];
  },
});

module.exports = { withKesaseteliSecurityHeaders };

/* eslint-enable unicorn/prefer-module */
