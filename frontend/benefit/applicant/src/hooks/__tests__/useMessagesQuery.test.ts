import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MESSAGE_URLS } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import i18n from '../../../test/i18n/i18n-test';
import useMessagesQuery from '../useMessagesQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: i18n.t.bind(i18n),
  }),
}));

jest.mock('benefit-shared/utils/common', () => ({
  mapMessages: jest.fn(() => [{ id: 'mapped-message' }]),
}));

jest.mock('shared/components/toast/show-error-toast');
jest.mock('shared/hooks/useBackendAPI');

describe('useMessagesQuery', () => {
  const mockGet = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        get: mockGet,
      },
      handleResponse: mockHandleResponse,
    });
    (useQuery as jest.Mock).mockReturnValue({
      isError: false,
    });
  });

  it('sets expected query key, interval and enabled flag', () => {
    renderHook(() => useMessagesQuery('app-1', MESSAGE_URLS.MESSAGES, true));

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];

    expect(queryConfig.queryKey).toEqual([
      'messages',
      'app-1',
      MESSAGE_URLS.MESSAGES,
    ]);
    expect(queryConfig.refetchInterval).toBe(30_000);
    expect(queryConfig.enabled).toBe(true);
  });

  it('calls messages endpoint in queryFn', async () => {
    mockGet.mockResolvedValue({ data: [] });

    renderHook(() => useMessagesQuery('app-1', MESSAGE_URLS.NOTES, false));

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];
    await queryConfig.queryFn();

    expect(mockGet).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/${MESSAGE_URLS.NOTES}`
    );
  });

  it('shows translated fetch error toast when query has an error', () => {
    (useQuery as jest.Mock).mockReturnValue({
      isError: true,
    });

    renderHook(() => useMessagesQuery('app-1', MESSAGE_URLS.MESSAGES, true));

    expect(showErrorToast).toHaveBeenCalledWith(
      i18n.t('common:messenger.list.errors.fetch.label'),
      i18n.t('common:messenger.list.errors.fetch.text')
    );
  });
});
