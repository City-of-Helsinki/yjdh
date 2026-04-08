import { renderHook } from '@testing-library/react-hooks';
import Router from 'next/router';

import useConfirm from '../useConfirm';
import useLeaveConfirm from '../useLeaveConfirm';

jest.mock('next/router', () => ({
  __esModule: true,
  default: {
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    push: jest.fn(() => Promise.resolve(true)),
  },
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../useConfirm', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useLeaveConfirm', () => {
  const confirmMock = jest.fn();
  const mockRouter = Router as unknown as {
    asPath: string;
    events: {
      on: jest.Mock;
      off: jest.Mock;
      emit: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    confirmMock.mockResolvedValue(true);
    (useConfirm as jest.Mock).mockReturnValue({
      confirm: confirmMock,
    });
  });

  describe('handleRouteChange', () => {
    it('should not trigger confirmation on same-page hash change', () => {
      mockRouter.asPath = '/application?id=123';
      renderHook(() => useLeaveConfirm(true, 'message'));

      const onCall = mockRouter.events.on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'routeChangeStart'
      );
      const handleRouteChange = onCall[1] as (url: string) => void;

      handleRouteChange('/application?id=123#field');

      expect(confirmMock).not.toHaveBeenCalled();
    });

    it('should trigger confirmation on different page navigation', () => {
      mockRouter.asPath = '/application?id=123';
      renderHook(() => useLeaveConfirm(true, 'message'));

      const onCall = mockRouter.events.on.mock.calls.find(
        (call: [string, unknown]) => call[0] === 'routeChangeStart'
      );
      const handleRouteChange = onCall[1] as (url: string) => void;

      try {
        handleRouteChange('/other-page');
      } catch {
        // It throws 'Abort route change'
      }

      expect(confirmMock).toHaveBeenCalled();
    });
  });

  describe('handleGlobalClick', () => {
    const originalLocation = window.location;

    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete (window as { location?: Location }).location;
      // eslint-disable-next-line scanjs-rules/assign_to_location
      // @ts-ignore
      (window as { location: Location }).location = {
        ...originalLocation,
        pathname: '/application',
        search: '?id=123',
        origin: 'http://localhost',
        href: 'http://localhost/application?id=123',
      } as Location;
    });

    afterAll(() => {
      // eslint-disable-next-line scanjs-rules/assign_to_location
      // @ts-ignore
      (window as { location: Location }).location = originalLocation;
    });

    it('should not trigger confirmation on internal anchor click', () => {
      mockRouter.asPath = '/application?id=123';
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      renderHook(() => useLeaveConfirm(true, 'message'));
      const clickCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'click'
      );
      const handleGlobalClick = clickCall?.[1] as (e: MouseEvent) => void;

      const anchor = document.createElement('a');
      // eslint-disable-next-line scanjs-rules/assign_to_href
      anchor.href = 'http://localhost/application?id=123#field';

      const event = {
        target: anchor,
        preventDefault: jest.fn(),
      } as unknown as MouseEvent;

      handleGlobalClick(event);

      expect(confirmMock).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(event.preventDefault).not.toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should trigger confirmation on external-like internal link (different page)', () => {
      mockRouter.asPath = '/application?id=123';
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      renderHook(() => useLeaveConfirm(true, 'message'));
      const clickCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'click'
      );
      const handleGlobalClick = clickCall?.[1] as (e: MouseEvent) => void;

      const anchor = document.createElement('a');
      // eslint-disable-next-line scanjs-rules/assign_to_href
      anchor.href = 'http://localhost/other-page';

      const event = {
        target: anchor,
        preventDefault: jest.fn(),
      } as unknown as MouseEvent;

      handleGlobalClick(event);

      expect(confirmMock).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(event.preventDefault).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });
});
