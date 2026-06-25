import Router from 'next/router';

import {
  getAnchorPath,
  getPathWithoutHash,
  isBypassUrl,
  isInternalLink,
  shouldBlockNavigation,
} from '../useLeaveConfirm.utils';

jest.mock('next/router', () => ({
  __esModule: true,
  default: {
    asPath: '/current-page',
  },
}));

describe('useLeaveConfirm.utils', () => {
  describe('getPathWithoutHash', () => {
    it('should remove hash from path', () => {
      expect(getPathWithoutHash('/path#hash')).toBe('/path');
    });
  });

  describe('isInternalLink', () => {
    const originalHref = globalThis.location.href;

    beforeAll(() => {
      window.history.replaceState({}, '', '/current-page');
    });

    afterAll(() => {
      window.history.replaceState({}, '', originalHref);
    });

    it('should return true for internal links', () => {
      const anchor = document.createElement('a');
      // eslint-disable-next-line scanjs-rules/assign_to_href
      anchor.href = 'http://localhost/other';
      expect(isInternalLink(anchor)).toBe(true);
    });

    it('should return false for links starting with #', () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', '#');
      expect(isInternalLink(anchor)).toBe(false);

      const anchor2 = document.createElement('a');
      anchor2.setAttribute('href', '#some-section');
      expect(isInternalLink(anchor2)).toBe(false);
    });

    it('should return false if href is missing', () => {
      const anchor = document.createElement('a');
      expect(isInternalLink(anchor)).toBe(false);
    });
  });

  describe('isBypassUrl', () => {
    it('should bypass for sessionExpired=true', () => {
      expect(isBypassUrl('/?sessionExpired=true')).toBe(true);
    });

    it('should bypass for /500', () => {
      expect(isBypassUrl('/500')).toBe(true);
    });
  });

  describe('shouldBlockNavigation', () => {
    beforeEach(() => {
      Router.asPath = '/current';
    });

    it('should return true if blocking is required', () => {
      expect(
        shouldBlockNavigation({
          targetUrl: '/other',
          unsavedChanges: true,
          isConfirmed: false,
          globalBypass: false,
        })
      ).toBe(true);
    });

    it('should return false if already confirmed', () => {
      expect(
        shouldBlockNavigation({
          targetUrl: '/other',
          unsavedChanges: true,
          isConfirmed: true,
          globalBypass: false,
        })
      ).toBe(false);
    });

    it('should return false for same page', () => {
      expect(
        shouldBlockNavigation({
          targetUrl: '/current#hash',
          unsavedChanges: true,
          isConfirmed: false,
          globalBypass: false,
        })
      ).toBe(false);
    });
  });

  describe('getAnchorPath', () => {
    it('should return path for internal anchor click', () => {
      const anchor = document.createElement('a');
      // eslint-disable-next-line scanjs-rules/assign_to_href
      anchor.href = 'http://localhost/target';
      const event = { target: anchor } as unknown as MouseEvent;
      expect(getAnchorPath(event)).toBe('/target');
    });
  });
});
