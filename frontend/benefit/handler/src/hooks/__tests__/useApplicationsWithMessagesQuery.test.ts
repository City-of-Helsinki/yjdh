import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useAuth from 'shared/hooks/useAuth';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApplicationsWithMessagesQuery from '../useApplicationsWithMessagesQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/hooks/useAuth', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useApplicationsWithMessagesQuery', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedQueryFn: () => unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });

    (useQuery as jest.Mock).mockImplementation((options) => {
      capturedQueryFn = options.queryFn as () => unknown;
      return { isError: false };
    });
  });

  it('is enabled only when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    renderHook(() => useApplicationsWithMessagesQuery());

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls the applications with unread messages endpoint', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue([]);

    renderHook(() => useApplicationsWithMessagesQuery());

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      BackendEndpoint.APPLICATIONS_WITH_UNREAD_MESSAGES,
      expect.any(Object)
    );
  });

  it('shows error toast when query has error', () => {
    (useQuery as jest.Mock).mockReturnValue({ isError: true });

    renderHook(() => useApplicationsWithMessagesQuery());

    expect(showErrorToast).toHaveBeenCalled();
  });
});
