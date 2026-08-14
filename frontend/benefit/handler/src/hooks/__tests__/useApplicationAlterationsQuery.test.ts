import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApplicationAlterationsQuery from '../useApplicationAlterationsQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useApplicationAlterationsQuery', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedQueryFn: () => unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });

    (useQuery as jest.Mock).mockImplementation((options) => {
      capturedQueryFn = options.queryFn as () => unknown;
      return { isError: false };
    });
  });

  it('calls the alteration endpoint with state=received and default order_by', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue([]);

    renderHook(() => useApplicationAlterationsQuery());

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      BackendEndpoint.HANDLER_APPLICATION_ALTERATION,
      expect.objectContaining({
        params: expect.objectContaining({
          state: 'received',
          order_by: 'id',
        }),
      })
    );
  });

  it('uses the provided orderBy param', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue([]);

    renderHook(() => useApplicationAlterationsQuery('created_at'));

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ order_by: 'created_at' }),
      })
    );
  });

  it('shows error toast when query has error', () => {
    (useQuery as jest.Mock).mockReturnValue({ isError: true });

    renderHook(() => useApplicationAlterationsQuery());

    expect(showErrorToast).toHaveBeenCalled();
  });
});
