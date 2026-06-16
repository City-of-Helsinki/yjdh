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
        source: '/(.*)',
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
      "script-src 'self' 'unsafe-inline' https://webanalytics.digiaiiris.com"
    );
    expect(csp).toContain(
      "img-src 'self' blob: data: https://webanalytics.digiaiiris.com"
    );
  });
});
