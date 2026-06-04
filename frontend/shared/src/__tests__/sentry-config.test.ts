/* eslint-disable simple-import-sort/imports */
import * as Sentry from '@sentry/nextjs';
import sentryConfig from '../../sentry-config';
/* eslint-enable simple-import-sort/imports */

jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  browserTracingIntegration: jest.fn(),
  replayIntegration: jest.fn(),
}));

describe('sentryConfig', () => {
  let beforeSend: (
    event: Sentry.Event,
    hint?: Sentry.EventHint
  ) => Sentry.Event | null | PromiseLike<Sentry.Event | null>;

  beforeEach(() => {
    jest.clearAllMocks();
    sentryConfig();
    const initSpy = Sentry.init as jest.Mock;
    const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
    beforeSend = config.beforeSend as typeof beforeSend;
  });

  it('should initialize Sentry and register beforeSend', () => {
    const initSpy = Sentry.init as jest.Mock;
    expect(initSpy).toHaveBeenCalled();
    expect(typeof beforeSend).toBe('function');
  });

  it('should not ignore standard events without exceptions', () => {
    const event: Sentry.Event = { message: 'Normal log message' };
    const result = beforeSend(event);
    expect(result).toEqual(event);
  });

  it('should ignore errors with matching URL and status code', () => {
    const event: Sentry.Event = { message: 'Error' };
    const hint: Sentry.EventHint = {
      originalException: {
        config: { url: '/oidc/userinfo' },
        response: { status: 401 },
      },
    };
    const result = beforeSend(event, hint);
    expect(result).toBeNull();
  });

  it('should ignore errors with matching URL and status code 0', () => {
    sentryConfig([{ url: '/oidc/userinfo', status: 0 }]);
    const initSpy = Sentry.init as jest.Mock;
    const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
    const config = lastCall?.[0] as Sentry.BrowserOptions;
    const customBeforeSend = config.beforeSend as typeof beforeSend;

    const event: Sentry.Event = { message: 'Error' };
    const hint: Sentry.EventHint = {
      originalException: {
        config: { url: '/oidc/userinfo' },
        response: { status: 0 },
      },
    };
    const result = customBeforeSend(event, hint);
    expect(result).toBeNull();
  });

  it('should NOT ignore errors with matching URL but a different status code (e.g. 500)', () => {
    const event: Sentry.Event = { message: 'Error' };
    const hint: Sentry.EventHint = {
      originalException: {
        config: { url: '/oidc/userinfo' },
        response: { status: 500 },
      },
    };
    const result = beforeSend(event, hint);
    expect(result).toEqual(event);
  });

  describe('custom ignoredApiErrors settings', () => {
    it('should NOT ignore errors matching status code if URL is not specified in the ignore rule', () => {
      sentryConfig([{ status: 401 }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/some/other/url' },
          response: { status: 401 },
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should NOT ignore errors when status code and error message are not specified in the ignore rule (matching URL only)', () => {
      sentryConfig([{ url: '/oidc/userinfo' }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo' },
          response: { status: 500 },
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should ignore errors when the URL string matches as a substring (in the middle of a URL)', () => {
      sentryConfig([{ url: '/oidc/userinfo', status: 401 }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: {
            url: 'https://example.com/api/v1/oidc/userinfo/details?param=1',
          },
          response: { status: 401 },
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toBeNull();
    });

    it('should ignore errors when status matches error status code and URL matches', () => {
      sentryConfig([{ url: '/custom-url', status: 403 }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/custom-url' },
          response: { status: 403 },
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toBeNull();
    });

    it('should NOT ignore errors when error message is specified in the ignore rule but URL is not specified', () => {
      sentryConfig([{ errorMessage: 'timeout' }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Request timeout' };
      const hint: Sentry.EventHint = {
        originalException: new Error('Request timeout exceeded'),
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should ignore errors when error message contains specified errorMessage and URL matches', () => {
      sentryConfig([{ url: '/oidc/userinfo', errorMessage: 'timeout' }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Request timeout' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo' },
          message: 'Request timeout exceeded',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toBeNull();
    });

    it('should ignore errors when url matches specified RegExp and status matches', () => {
      sentryConfig([{ url: /\/oidc\/userinfo.*/, status: 401 }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo?foo=bar' },
          response: { status: 401 },
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toBeNull();
    });

    it('should NOT ignore errors when url does not match specified RegExp even if status matches', () => {
      sentryConfig([{ url: /\/oidc\/userinfo$/, status: 401 }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo/extra' },
          response: { status: 401 },
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should NOT ignore errors when error message does not contain specified errorMessage even if URL matches RegExp', () => {
      sentryConfig([{ url: /\/oidc\/userinfo.*/, errorMessage: 'timeout' }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Connection refused' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo?param=1' },
          message: 'Connection refused',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should ignore errors when error message contains specified errorMessage and URL matches RegExp', () => {
      sentryConfig([{ url: /\/oidc\/userinfo.*/, errorMessage: 'timeout' }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Request timeout' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo?param=1' },
          message: 'Request timeout exceeded',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toBeNull();
    });

    it('should NOT ignore errors when error message does not contain specified errorMessage even if URL matches', () => {
      sentryConfig([{ url: '/oidc/userinfo', errorMessage: 'timeout' }]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Connection refused' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/oidc/userinfo' },
          message: 'Connection refused',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should ignore errors when URL, status, and errorMessage all match (invalid JSDoc/JavaScript configuration)', () => {
      sentryConfig([
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error - Testing invalid JavaScript/JSDoc configuration containing both status and errorMessage
        { url: '/api/v1', status: 502, errorMessage: 'Bad Gateway' },
      ]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: '502 Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/api/v1/users' },
          response: { status: 502 },
          message: 'Error: Bad Gateway received',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toBeNull();
    });

    it('should NOT ignore errors when URL and status match but errorMessage does not match (invalid JSDoc/JavaScript configuration)', () => {
      sentryConfig([
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error - Testing invalid JavaScript/JSDoc configuration containing both status and errorMessage
        { url: '/api/v1', status: 502, errorMessage: 'Bad Gateway' },
      ]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: '502 Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/api/v1/users' },
          response: { status: 502 },
          message: 'Error: Internal Server Error',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });

    it('should NOT ignore errors when rule has no properties defined', () => {
      sentryConfig([{}]);
      const initSpy = Sentry.init as jest.Mock;
      const lastCall = initSpy.mock.calls[initSpy.mock.calls.length - 1];
      const config = lastCall?.[0] as Sentry.BrowserOptions;
      const customBeforeSend = config.beforeSend as typeof beforeSend;

      const event: Sentry.Event = { message: 'Error' };
      const hint: Sentry.EventHint = {
        originalException: {
          config: { url: '/api/v1/users' },
          response: { status: 500 },
          message: 'Internal Error',
        },
      };
      const result = customBeforeSend(event, hint);
      expect(result).toEqual(event);
    });
  });

  describe('tracePropagationTargets config', () => {
    let originalEnv: string | undefined;

    beforeAll(() => {
      originalEnv = process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS;
    });

    afterAll(() => {
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS;
      } else {
        process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS = originalEnv;
      }
    });

    it('should result in empty tracePropagationTargets when env var is unset', () => {
      delete process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS;
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracePropagationTargets).toEqual([]);
    });

    it('should result in empty tracePropagationTargets when env var is an empty string', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS = '';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracePropagationTargets).toEqual([]);
    });

    it('should correctly parse comma-separated targets and ignore empty values', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS =
        'https://api.example.com,,https://localhost:8000';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracePropagationTargets).toEqual([
        'https://api.example.com',
        'https://localhost:8000',
      ]);
    });

    it('should trim whitespace from targets', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS =
        '  https://api.example.com , https://localhost:8000  ';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracePropagationTargets).toEqual([
        'https://api.example.com',
        'https://localhost:8000',
      ]);
    });
  });

  describe('tracesSampleRate config', () => {
    let originalEnv: string | undefined;

    beforeAll(() => {
      originalEnv = process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
    });

    afterAll(() => {
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
      } else {
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = originalEnv;
      }
    });

    it('should use 1 when NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE is unset', () => {
      delete process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracesSampleRate).toBe(1);
    });

    it('should use the valid value when NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE is between 0 and 1', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = '0.5';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracesSampleRate).toBe(0.5);
    });

    it('should fallback to 1 when NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE is invalid (NaN)', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = 'invalid';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracesSampleRate).toBe(1);
    });

    it('should parse negative values directly', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = '-0.1';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracesSampleRate).toBe(-0.1);
    });

    it('should parse values greater than 1 directly', () => {
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = '1.1';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.tracesSampleRate).toBe(1.1);
    });
  });

  describe('replays sample rates config', () => {
    let originalSessionRate: string | undefined;
    let originalErrorRate: string | undefined;

    beforeAll(() => {
      originalSessionRate =
        process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
      originalErrorRate =
        process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
    });

    afterAll(() => {
      if (originalSessionRate === undefined) {
        delete process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
      } else {
        process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE =
          originalSessionRate;
      }
      if (originalErrorRate === undefined) {
        delete process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
      } else {
        process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE =
          originalErrorRate;
      }
    });

    it('should fallback to 0 when sample rate env vars are unset', () => {
      delete process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
      delete process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.replaysSessionSampleRate).toBe(0);
      expect(config.replaysOnErrorSampleRate).toBe(0);
    });

    it('should parse replays sample rates even if they are out of bounds', () => {
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '1.5';
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '-0.5';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.replaysSessionSampleRate).toBe(1.5);
      expect(config.replaysOnErrorSampleRate).toBe(-0.5);
    });

    it('should fallback to 0 when replays sample rates are NaN', () => {
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = 'invalid';
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE =
        'not-a-number';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.replaysSessionSampleRate).toBe(0);
      expect(config.replaysOnErrorSampleRate).toBe(0);
    });

    it('should parse valid sample rates correctly', () => {
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE = '0.25';
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = '0.8';
      jest.clearAllMocks();
      sentryConfig();
      const initSpy = Sentry.init as jest.Mock;
      const config = initSpy.mock.calls[0]?.[0] as Sentry.BrowserOptions;
      expect(config.replaysSessionSampleRate).toBe(0.25);
      expect(config.replaysOnErrorSampleRate).toBe(0.8);
    });
  });
});
