import { renderHook } from '@testing-library/react-hooks';
import Router from 'next/router';
import useLeaveConfirm from '../useLeaveConfirm';
import useConfirm from '../useConfirm';

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

  beforeEach(() => {
    jest.clearAllMocks();
    confirmMock.mockResolvedValue(true);
    (useConfirm as jest.Mock).mockReturnValue({
      confirm: confirmMock,
    });
  });

  describe('handleRouteChange', () => {
    it('should not trigger confirmation on same-page hash change', () => {
      (Router as any).asPath = '/application?id=123';
      renderHook(() => useLeaveConfirm(true, 'message'));

      const onCall = (Router.events.on as jest.Mock).mock.calls.find(
        (call) => call[0] === 'routeChangeStart'
      );
      const handleRouteChange = onCall[1];

      handleRouteChange('/application?id=123#field');

      expect(confirmMock).not.toHaveBeenCalled();
    });

    it('should trigger confirmation on different page navigation', () => {
      (Router as any).asPath = '/application?id=123';
      renderHook(() => useLeaveConfirm(true, 'message'));

      const onCall = (Router.events.on as jest.Mock).mock.calls.find(
        (call) => call[0] === 'routeChangeStart'
      );
      const handleRouteChange = onCall[1];

      try {
        handleRouteChange('/other-page');
      } catch (e) {
        // It throws 'Abort route change'
      }

      expect(confirmMock).toHaveBeenCalled();
    });
  });

  describe('handleGlobalClick', () => {
    const originalLocation = window.location;

    beforeAll(() => {
      // @ts-ignore
      delete window.location;
      window.location = {
        pathname: '/application',
        search: '?id=123',
        origin: 'http://localhost',
        href: 'http://localhost/application?id=123',
      } as any;
    });

    afterAll(() => {
      // @ts-ignore
      window.location = originalLocation;
    });

    it('should not trigger confirmation on internal anchor click', () => {
      (Router as any).asPath = '/application?id=123';
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      renderHook(() => useLeaveConfirm(true, 'message'));
      const clickCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'click'
      );
      const handleGlobalClick = clickCall?.[1] as (e: MouseEvent) => void;

      const anchor = document.createElement('a');
      anchor.href = 'http://localhost/application?id=123#field';

      const event = {
        target: anchor,
        preventDefault: jest.fn(),
      } as unknown as MouseEvent;

      handleGlobalClick(event);

      expect(confirmMock).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should trigger confirmation on external-like internal link (different page)', () => {
      (Router as any).asPath = '/application?id=123';
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      renderHook(() => useLeaveConfirm(true, 'message'));
      const clickCall = addEventListenerSpy.mock.calls.find(
        (call) => call[0] === 'click'
      );
      const handleGlobalClick = clickCall?.[1] as (e: MouseEvent) => void;

      const anchor = document.createElement('a');
      anchor.href = 'http://localhost/other-page';

      const event = {
        target: anchor,
        preventDefault: jest.fn(),
      } as unknown as MouseEvent;

      handleGlobalClick(event);

      expect(confirmMock).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });
});
