import { act, renderHook } from '@testing-library/react-hooks';
import singletonRouter from 'next-router-mock';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';
import { initMatomo, trackPageView } from 'shared/utils/matomo';

import useMatomo from '../useMatomo';

jest.mock('shared/utils/matomo', () => ({
  initMatomo: jest.fn(),
  trackPageView: jest.fn(),
}));

describe('useMatomo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize matomo if configured', () => {
    const { result } = renderHook(
      () =>
        useMatomo({
          enabled: true,
          url: 'https://matomo.example.com',
          siteId: '123',
        }),
      { wrapper: MemoryRouterProvider }
    );

    expect(result.current).toBe(true);
    expect(initMatomo).toHaveBeenCalledWith({
      url: 'https://matomo.example.com',
      siteId: '123',
      jsTrackerFile: undefined,
      phpTrackerFile: undefined,
    });
  });

  it('should track page views on route changes but skip initial load', () => {
    renderHook(
      () =>
        useMatomo({
          enabled: true,
          url: 'https://matomo.example.com',
          siteId: '123',
        }),
      { wrapper: MemoryRouterProvider }
    );

    expect(trackPageView).not.toHaveBeenCalled();

    void act(() => {
      void singletonRouter.push('/new-path');
    });

    expect(trackPageView).toHaveBeenCalledTimes(1);
  });
});
