import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import useHandlerNotesQuery from '../useHandlerNotesQuery';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';
const TEST_TARGET_ID = 'abc-123';
const TEST_TARGET_TYPE = 'youthapplication';

describe('useHandlerNotesQuery', () => {
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

  it('does not fetch when targetId is not provided', () => {
    const interceptor = nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.HANDLER_NOTES)
      .reply(200, []);

    const { result } = renderHook(() => useHandlerNotesQuery(TEST_TARGET_TYPE), {
      wrapper,
    });

    expect(result.current.isIdle).toBe(true);
    expect(interceptor.isDone()).toBe(false);
  });

  it('fetches notes successfully with query params', async () => {
    const mockData = [{ id: '1', content: 'note 1' }];
    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.HANDLER_NOTES)
      .query({ target_type: TEST_TARGET_TYPE, target_id: TEST_TARGET_ID })
      .reply(200, mockData);

    const { result, waitFor } = renderHook(
      () => useHandlerNotesQuery(TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );
    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(mockData);
    expect(nock.isDone()).toBe(true);
  });

  it('calls useErrorHandler on query failure', async () => {
    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.HANDLER_NOTES)
      .query({ target_type: TEST_TARGET_TYPE, target_id: TEST_TARGET_ID })
      .reply(500, 'server error');

    const { result, waitFor } = renderHook(
      () => useHandlerNotesQuery(TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );
    await waitFor(() => result.current.isError);
    expect(mockErrorHandler).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });
});
