import Router from 'next/router';
import {
  getPathWithoutHash,
  isBypassUrl,
  isInternalLink,
  shouldBlockNavigation,
  getAnchorPath,
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
    const originalLocation = window.location;
    beforeAll(() => {
      delete (window as { location?: Location }).location;
      (window as { location: Location }).location = {
        ...originalLocation,
        origin: 'http://localhost',
      } as Location;
    });
    afterAll(() => {
      (window as { location: Location }).location = originalLocation;
    });

    it('should return true for internal links', () => {
      const anchor = document.createElement('a');
      anchor.href = 'http://localhost/other';
      expect(isInternalLink(anchor)).toBe(true);
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
      anchor.href = 'http://localhost/target';
      const event = { target: anchor } as unknown as MouseEvent;
      expect(getAnchorPath(event)).toBe('/target');
    });
  });
});
