import { initMatomo, trackEvent, trackPageView } from 'shared/utils/matomo';

describe('matomo', () => {
  beforeEach(() => {
    globalThis._paq = [];
    document.head.innerHTML = '<script src="test.js"></script>';
  });

  afterEach(() => {
    delete globalThis._paq;
  });

  describe('initMatomo', () => {
    it('should initialize _paq with correct order: consent, config, then tracking', () => {
      initMatomo({
        url: '//matomo.example.com/',
        siteId: '42',
      });

      const commands = (globalThis._paq || []).flat();
      const setTrackerIdx = commands.indexOf('setTrackerUrl');
      const setSiteIdIdx = commands.indexOf('setSiteId');
      const trackPageViewIdx = commands.indexOf('trackPageView');

      expect(setTrackerIdx).toBeGreaterThan(-1);
      expect(setSiteIdIdx).toBeGreaterThan(-1);
      expect(trackPageViewIdx).toBeGreaterThan(-1);
      // Config must come before tracking
      expect(setTrackerIdx).toBeLessThan(trackPageViewIdx);
      expect(setSiteIdIdx).toBeLessThan(trackPageViewIdx);
    });

    it('should add trailing slash to url if missing', () => {
      initMatomo({
        url: '//matomo.example.com',
        siteId: '1',
      });

      const trackerUrl = (globalThis._paq || []).find(
        (cmd) => cmd[0] === 'setTrackerUrl'
      );
      expect(trackerUrl).toEqual([
        'setTrackerUrl',
        '//matomo.example.com/matomo.php',
      ]);
    });

    it('should use custom tracker file names', () => {
      initMatomo({
        url: '//matomo.example.com/',
        siteId: '1',
        jsTrackerFile: 'piwik.min.js',
        phpTrackerFile: 'tracker.php',
      });

      const trackerUrl = (globalThis._paq || []).find(
        (cmd) => cmd[0] === 'setTrackerUrl'
      );
      expect(trackerUrl).toEqual([
        'setTrackerUrl',
        '//matomo.example.com/tracker.php',
      ]);

      const script = document.querySelector('script[src*="piwik.min.js"]');
      expect(script).toBeTruthy();
    });

    it('should push requireConsent', () => {
      initMatomo({
        url: '//matomo.example.com/',
        siteId: '1',
      });

      const commands = (globalThis._paq || []).flat();
      expect(commands).toContain('requireConsent');
      expect(commands).not.toContain('requireCookieConsent');
    });

    it('should insert script tag into document', () => {
      initMatomo({
        url: '//matomo.example.com/',
        siteId: '1',
      });

      const script = document.querySelector(
        'script[src="//matomo.example.com/matomo.js"]'
      );
      expect(script).toBeTruthy();
    });
  });

  describe('trackPageView', () => {
    it('should push setCustomUrl, setDocumentTitle and trackPageView', () => {
      globalThis._paq = [];
      trackPageView();
      expect(globalThis._paq).toContainEqual([
        'setCustomUrl',
        globalThis.location.href,
      ]);
      expect(globalThis._paq).toContainEqual([
        'setDocumentTitle',
        document.title,
      ]);
      expect(globalThis._paq).toContainEqual(['trackPageView']);
    });

    it('should set referrer url and custom url on subsequent navigations', () => {
      globalThis._paq = [];
      trackPageView('/new-page');
      expect(globalThis._paq).toContainEqual([
        'setReferrerUrl',
        expect.any(String),
      ]);
      expect(globalThis._paq).toContainEqual([
        'setCustomUrl',
        `${globalThis.location.origin}/new-page`,
      ]);
      expect(globalThis._paq).toContainEqual([
        'setDocumentTitle',
        document.title,
      ]);
      expect(globalThis._paq).toContainEqual(['trackPageView']);
    });

    it('should not push if _paq is not defined', () => {
      delete globalThis._paq;
      expect(() => trackPageView()).not.toThrow();
    });
  });

  describe('trackEvent', () => {
    it('should push trackEvent with category and action', () => {
      globalThis._paq = [];
      trackEvent('Category', 'Action');
      expect(globalThis._paq).toContainEqual([
        'trackEvent',
        'Category',
        'Action',
      ]);
    });

    it('should include optional name and value', () => {
      globalThis._paq = [];
      trackEvent('Category', 'Action', 'Name', 42);
      expect(globalThis._paq).toContainEqual([
        'trackEvent',
        'Category',
        'Action',
        'Name',
        42,
      ]);
    });

    it('should filter out undefined optional params', () => {
      globalThis._paq = [];
      trackEvent('Category', 'Action');
      expect(globalThis._paq).toContainEqual([
        'trackEvent',
        'Category',
        'Action',
      ]);
    });

    it('should not push if _paq is not defined', () => {
      delete globalThis._paq;
      expect(() => trackEvent('Cat', 'Act')).not.toThrow();
    });
  });
});
