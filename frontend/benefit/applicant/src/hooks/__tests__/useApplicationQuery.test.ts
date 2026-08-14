import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApplicationQuery from '../useApplicationQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useApplicationQuery', () => {
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

  it('uses id in query key and fetch endpoint when id is present', async () => {
    mockGet.mockResolvedValue({ data: {} });

    renderHook(() => useApplicationQuery('app-1'));

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];
    await queryConfig.queryFn();

    expect(queryConfig.queryKey).toEqual(['applications', 'app-1']);
    expect(queryConfig.enabled).toBe(true);
    expect(mockGet).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/`
    );
  });

  it('disables query and rejects when id is missing', async () => {
    renderHook(() => useApplicationQuery(''));

    const queryConfig = (useQuery as jest.Mock).mock.calls[0][0];

    expect(queryConfig.enabled).toBe(false);
    await expect(queryConfig.queryFn()).rejects.toThrow(
      'Missing application id'
    );
    expect(mockGet).not.toHaveBeenCalled();
  });
});
