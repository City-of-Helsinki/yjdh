import { renderHook } from '@testing-library/react';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGoToPage from 'shared/hooks/useGoToPage';

import useUserQuery from '../useUserQuery';

jest.mock('shared/hooks/useErrorHandler');
jest.mock('shared/hooks/useGoToPage');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const createWrapper = (): {
  queryClient: QueryClient;
  wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: jest.fn(),
      },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('useUserQuery error handling', () => {
  const mockGoToPage = jest.fn();
  const mockRouter = {
    route: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGoToPage as jest.Mock).mockReturnValue(mockGoToPage);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('sets up useErrorHandler with correct onServerError callback and redirects to login with error', () => {
    const { wrapper } = createWrapper();
    renderHook(() => useUserQuery(), { wrapper });

    expect(useErrorHandler).toHaveBeenCalled();
    const errorHandlerConfig = (useErrorHandler as jest.Mock).mock.calls[0][0];

    expect(errorHandlerConfig).toHaveProperty('onServerError');
    errorHandlerConfig.onServerError();
    expect(mockGoToPage).toHaveBeenCalledWith(`${ROUTES.LOGIN}?error=true`);
  });

  describe('onAuthError callback', () => {
    it.each([
      [ROUTES.LOGIN, false],
      [ROUTES.COOKIE_SETTINGS, false],
      ['/', true],
      ['/dashboard', true],
    ])(
      'when route is %s, should redirect to login page: %s',
      (route, shouldRedirect) => {
        mockRouter.route = route;
        const { wrapper } = createWrapper();
        renderHook(() => useUserQuery(), { wrapper });

        const errorHandlerConfig = (useErrorHandler as jest.Mock).mock
          .calls[0][0];
        expect(errorHandlerConfig).toHaveProperty('onAuthError');

        errorHandlerConfig.onAuthError();

        if (shouldRedirect) {
          expect(mockGoToPage).toHaveBeenCalledWith(
            `${ROUTES.LOGIN}?sessionExpired=true`
          );
        } else {
          expect(mockGoToPage).not.toHaveBeenCalled();
        }
      }
    );
  });
});
