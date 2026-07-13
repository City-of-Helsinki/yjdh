import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import useApplicationTimelineQuery from '../useApplicationTimelineQuery';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';
const TEST_ID = 'abc-123';
const YOUTH_ENDPOINT = `${BackendEndpoint.YOUTH_APPLICATIONS}${TEST_ID}/timeline/`;
const EMPLOYER_ENDPOINT = `${BackendEndpoint.EMPLOYER_APPLICATIONS}${TEST_ID}/timeline/`;

describe('useApplicationTimelineQuery', () => {
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
    const interceptor = nock(API_BASE_TEST_URL)
      .get(new RegExp(BackendEndpoint.YOUTH_APPLICATIONS))
      .reply(200, []);

    const { result } = renderHook(() => useApplicationTimelineQuery(undefined, 'youth'), {
      wrapper,
    });

    expect(result.current.isIdle).toBe(true);
    expect(interceptor.isDone()).toBe(false);
  });

  it('fetches youth application timeline successfully by id', async () => {
    const mockData = [{ id: '1', content: 'test note 1' }];
    nock(API_BASE_TEST_URL).get(YOUTH_ENDPOINT).reply(200, mockData);
    const { result, waitFor } = renderHook(
      () => useApplicationTimelineQuery(TEST_ID, 'youth'),
      { wrapper }
    );
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(mockData);
    expect(nock.isDone()).toBe(true);
  });

  it('fetches employer application timeline successfully by id', async () => {
    const mockData = [{ id: '2', content: 'test note 2' }];
    nock(API_BASE_TEST_URL).get(EMPLOYER_ENDPOINT).reply(200, mockData);
    const { result, waitFor } = renderHook(
      () => useApplicationTimelineQuery(TEST_ID, 'employer'),
      { wrapper }
    );
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(mockData);
    expect(nock.isDone()).toBe(true);
  });

  it('calls useErrorHandler on 500 error', async () => {
    nock(API_BASE_TEST_URL).get(YOUTH_ENDPOINT).reply(500, 'server error');
    const { result, waitFor } = renderHook(
      () => useApplicationTimelineQuery(TEST_ID, 'youth'),
      { wrapper }
    );
    await waitFor(() => result.current.isError);
    expect(mockErrorHandler).toHaveBeenCalled();
  });
});
