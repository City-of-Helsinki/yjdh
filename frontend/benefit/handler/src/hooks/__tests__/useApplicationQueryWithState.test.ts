import '@testing-library/jest-dom';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApplicationQueryWithState from '../useApplicationQueryWithState';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

jest.mock(
  '../components/applicationForm/utils/applicationForm',
  () => ({
    getApplication: jest.fn((data) => data),
  }),
  { virtual: true }
);

describe('useApplicationQueryWithState', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedQueryFn: () => unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });

    (useQuery as jest.Mock).mockImplementation((options) => {
      capturedQueryFn = options.queryFn as () => unknown;
      return { data: undefined };
    });
  });

  it('is enabled only when id is provided', () => {
    const setApplication = jest.fn();
    renderHook(() => useApplicationQueryWithState('', setApplication));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls the handler applications endpoint with the given id', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue({});

    const setApplication = jest.fn();
    renderHook(() => useApplicationQueryWithState('app-1', setApplication));

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_APPLICATIONS}app-1/`
    );
  });

  it('rejects when id is empty', async () => {
    const setApplication = jest.fn();
    renderHook(() => useApplicationQueryWithState('', setApplication));

    await expect(capturedQueryFn()).rejects.toThrow('Missing application id');
  });

  it('calls setApplication when query returns data', () => {
    const mockData = { id: 'app-1', status: 'received' };
    const setApplication = jest.fn();

    (useQuery as jest.Mock).mockImplementation((options) => {
      capturedQueryFn = options.queryFn as () => unknown;
      return { data: mockData };
    });

    renderHook(() => useApplicationQueryWithState('app-1', setApplication));

    expect(setApplication).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'app-1' })
    );
  });
});
