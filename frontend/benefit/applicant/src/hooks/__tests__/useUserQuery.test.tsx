import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { User } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from 'shared/utils/localstorage.utils';

import i18n from '../../../test/i18n/i18n-test';
import { LOCAL_STORAGE_KEYS, ROUTES } from '../../constants';
import useUserQuery from '../useUserQuery';

const renderUseUserQuery = (): ReturnType<typeof renderHook> =>
  renderHook(() => useUserQuery());

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: i18n.t.bind(i18n),
  }),
}));

jest.mock('shared/components/toast/show-error-toast');
jest.mock('shared/hooks/useBackendAPI');
jest.mock('shared/hooks/useLocale');
jest.mock('shared/utils/localstorage.utils');

describe('useUserQuery', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockRouter = {
    route: '/applications',
    asPath: '/applications',
    push: mockPush,
  };

  const setRouterResult = (overrides = {}): void => {
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      ...overrides,
    });
  };

  const setUserQueryResult = (
    overrides: Partial<{
      data: User | undefined;
      isError: boolean;
      isSuccess: boolean;
      error: Error | null;
    }> = {}
  ): void => {
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isError: false,
      isSuccess: false,
      error: null,
      ...overrides,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setRouterResult();
    (useLocale as jest.Mock).mockReturnValue('fi');
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        get: mockGet,
        defaults: {
          headers: {},
        },
      },
      handleResponse: mockHandleResponse,
    });
    (getLocalStorageItem as jest.Mock).mockReturnValue('false');
    setUserQueryResult();
  });

  it('stores csrf token and terms approval marker when user requires terms approval', () => {
    const queryData = {
      id: 'user-1',
      csrfToken: 'csrf-token',
      termsOfServiceApprovalNeeded: true,
    } as User;

    setUserQueryResult({
      data: queryData,
      isSuccess: true,
    });

    renderUseUserQuery();

    expect(setLocalStorageItem).toHaveBeenCalledWith(
      LOCAL_STORAGE_KEYS.CSRF_TOKEN,
      'csrf-token'
    );
    expect(setLocalStorageItem).toHaveBeenCalledWith(
      LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED,
      'false'
    );
  });

  it('redirects to login when a 403 error happens on protected routes', () => {
    setUserQueryResult({
      isError: true,
      error: new Error('403'),
    });

    renderUseUserQuery();

    expect(mockPush).toHaveBeenCalledWith('fi/login');
    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('does not redirect on unauthorized routes when 401 or 403 occurs', () => {
    setRouterResult({
      route: ROUTES.LOGIN,
      asPath: ROUTES.LOGIN,
    });
    setUserQueryResult({
      isError: true,
      error: new Error('401'),
    });

    renderUseUserQuery();

    expect(mockPush).not.toHaveBeenCalled();
    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('redirects to logout login route when logout flag is present', () => {
    setRouterResult({
      route: '/login',
      asPath: '/login?logout=true',
    });
    setUserQueryResult({
      isError: true,
      error: new Error('500'),
    });

    renderUseUserQuery();

    expect(mockPush).toHaveBeenCalledWith('fi/login?logout=true');
    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('shows generic error toast for non-authentication errors', () => {
    setUserQueryResult({
      isError: true,
      error: new Error('500'),
    });

    renderUseUserQuery();

    expect(showErrorToast).toHaveBeenCalledWith(
      i18n.t('common:error.generic.label'),
      i18n.t('common:error.generic.text')
    );
  });

  it('adds terms parameter when terms are not yet approved', async () => {
    mockGet.mockResolvedValue({ data: {} });

    renderUseUserQuery();

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];
    await queryConfig.queryFn();

    expect(mockGet).toHaveBeenCalledWith(BackendEndpoint.USER_ME, {
      params: { terms: 1 },
    });
    expect(queryConfig.enabled).toBe(true);
    expect(queryConfig.retry).toBe(false);
  });

  it('omits terms parameter when terms are already approved', async () => {
    (getLocalStorageItem as jest.Mock).mockReturnValue('true');
    mockGet.mockResolvedValue({ data: {} });

    renderUseUserQuery();

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];
    await queryConfig.queryFn();

    expect(mockGet).toHaveBeenCalledWith(BackendEndpoint.USER_ME, {
      params: {},
    });
  });
});
