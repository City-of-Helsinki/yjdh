const { withKesaseteliSecurityHeaders } = require('../csp');

describe('withKesaseteliSecurityHeaders', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_MATOMO_URL;
    delete process.env.NODE_ENV;
  });

  it('should attach a production CSP with configured connect origins', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://localhost:8000';
    process.env.NEXT_PUBLIC_SENTRY_DSN =
      'https://public@sentry.test.hel.ninja/98';
    process.env.NEXT_PUBLIC_MATOMO_URL =
      'https://webanalytics.digiaiiris.com/js/';

    const config = withKesaseteliSecurityHeaders({ i18n: {} });
    const headers = await config.headers();
    const csp = headers[0].headers[0].value;

    expect(headers).toEqual([
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: expect.stringContaining(
              "connect-src 'self' https://localhost:8000 https://sentry.test.hel.ninja https://webanalytics.digiaiiris.com"
            ),
          },
        ],
      },
    ]);
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain(
      "script-src 'self' https://webanalytics.digiaiiris.com"
    );
    expect(csp).toContain(
      "img-src 'self' blob: data: https://webanalytics.digiaiiris.com"
    );
  });

  it('should not leave trailing whitespace when Matomo URL is unset', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://localhost:8000';

    const config = withKesaseteliSecurityHeaders({ i18n: {} });
    const headers = await config.headers();
    const csp = headers[0].headers[0].value;

    expect(csp).toContain("script-src 'self';");
    expect(csp).toContain("img-src 'self' blob: data:;");
    expect(csp).not.toMatch(/script-src 'self' ;/);
    expect(csp).not.toMatch(/img-src 'self' blob: data: ;/);
  });

  it('should preserve pre-existing headers from the wrapped config', async () => {
    const config = withKesaseteliSecurityHeaders({
      async headers() {
        return [
          {
            source: '/foo',
            headers: [{ key: 'X-Custom', value: '1' }],
          },
        ];
      },
    });
    const headers = await config.headers();

    expect(headers).toEqual([
      {
        source: '/foo',
        headers: [{ key: 'X-Custom', value: '1' }],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: expect.stringContaining("default-src 'self'"),
          },
        ],
      },
    ]);
  });
});
