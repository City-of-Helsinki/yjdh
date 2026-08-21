import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useCompanyQuery from '../useCompanyQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useCompanyQuery', () => {
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
    (useQuery as jest.Mock).mockReturnValue({});
  });

  it('uses company query key and infinite stale time', () => {
    renderHook(() => useCompanyQuery());

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];

    expect(queryConfig.queryKey).toEqual(['companyData']);
    expect(queryConfig.staleTime).toBe(Infinity);
  });

  it('calls company endpoint in queryFn', async () => {
    mockGet.mockResolvedValue({ data: {} });

    renderHook(() => useCompanyQuery());

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];
    await queryConfig.queryFn();

    expect(mockGet).toHaveBeenCalledWith(BackendEndpoint.COMPANY);
  });
});
