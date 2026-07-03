import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import useEmployerApplicationsListQuery from '../useEmployerApplicationsListQuery';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const API_BASE_TEST_URL = 'http://kesaseteli-api';
const mockListResponse = { count: 2, next: null, previous: null, results: [] };

describe('useEmployerApplicationsListQuery', () => {
  const axios = createAxiosTestContext(API_BASE_TEST_URL);
  const queryClient = createReactQueryTestClient(axios, API_BASE_TEST_URL);
  const mockErrorHandler = jest.fn();

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL={API_BASE_TEST_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BackendAPIProvider>
  );

  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
    (useErrorHandler as jest.Mock).mockReturnValue(mockErrorHandler);
    jest.clearAllMocks();
  });

  it('fetches paginated employer applications successfully', async () => {
    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.EMPLOYER_APPLICATIONS)
      // nock matches URLSearchParams via query object
      .query({
        status: ['submitted', 'handling'],
        limit: '20',
        offset: '0',
        ordering: '-created_at',
      })
      .reply(200, mockListResponse);

    const { result, waitFor } = renderHook(
      () =>
        useEmployerApplicationsListQuery({
          status: ['submitted', 'handling'],
          limit: 20,
          offset: 0,
          ordering: '-created_at',
        }),
      { wrapper }
    );
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(mockListResponse);
    expect(nock.isDone()).toBe(true);
  });

  it('calls useErrorHandler on error', async () => {
    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.EMPLOYER_APPLICATIONS)
      .query(true) // match any query params
      .reply(500, 'server error');

    const { result, waitFor } = renderHook(
      () => useEmployerApplicationsListQuery({ limit: 20, offset: 0 }),
      { wrapper }
    );
    await waitFor(() => result.current.isError);
    expect(mockErrorHandler).toHaveBeenCalled();
  });
});
