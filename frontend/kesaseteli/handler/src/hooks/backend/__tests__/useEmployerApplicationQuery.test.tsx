import { renderHook, waitFor } from '@testing-library/react';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import useEmployerApplicationQuery from '../useEmployerApplicationQuery';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';
const TEST_ID = 'abc-123';
const ENDPOINT = `${BackendEndpoint.EMPLOYER_APPLICATIONS}${TEST_ID}/`;

describe('useEmployerApplicationQuery', () => {
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

  it('does not fetch when no id is provided', () => {
    renderHook(() => useEmployerApplicationQuery(), { wrapper });
    expect(nock.activeMocks()).toHaveLength(0);
  });

  it('fetches application data successfully by id', async () => {
    const mockData = {
      id: TEST_ID,
      status: EmployerApplicationStatus.SUBMITTED,
    };
    nock(API_BASE_TEST_URL).get(ENDPOINT).reply(200, mockData);
    const { result } = renderHook(() => useEmployerApplicationQuery(TEST_ID), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
    expect(nock.isDone()).toBe(true);
  });

  it('calls useErrorHandler on 500 error', async () => {
    nock(API_BASE_TEST_URL).get(ENDPOINT).reply(500, 'server error');
    const { result } = renderHook(() => useEmployerApplicationQuery(TEST_ID), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockErrorHandler).toHaveBeenCalled();
  });

  it('does NOT call useErrorHandler on 404 error', async () => {
    nock(API_BASE_TEST_URL).get(ENDPOINT).reply(404, 'not found');
    const { result } = renderHook(() => useEmployerApplicationQuery(TEST_ID), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });
});
