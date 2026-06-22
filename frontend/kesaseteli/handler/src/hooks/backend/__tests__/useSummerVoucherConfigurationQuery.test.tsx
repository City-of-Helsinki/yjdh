import { renderHook, waitFor } from '@testing-library/react';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import useSummerVoucherConfigurationQuery from '../useSummerVoucherConfigurationQuery';

const API_BASE_TEST_URL = 'http://kesaseteli-api';

const mockConfigurationData = [
  {
    year: new Date().getFullYear(),
    voucher_value_in_euros: 300,
    min_work_compensation_in_euros: 400,
    min_work_hours: 18,
    target_groups: [],
  },
];

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseErrorHandler = useErrorHandler as jest.Mock;
const mockErrorHandler = jest.fn();

describe('useSummerVoucherConfigurationQuery', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  const axios = createAxiosTestContext(API_BASE_TEST_URL);
  const queryClient = createReactQueryTestClient(axios, API_BASE_TEST_URL);

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL={API_BASE_TEST_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BackendAPIProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
    mockUseErrorHandler.mockReturnValue(mockErrorHandler);
    jest.clearAllMocks();
  });

  it('returns configuration successfully', async () => {
    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
      .reply(200, mockConfigurationData);

    const { result } = renderHook(() => useSummerVoucherConfigurationQuery(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockConfigurationData);
    expect(nock.isDone()).toBe(true);
  });

  it('calls useErrorHandler on error', async () => {
    nock(API_BASE_TEST_URL)
      .get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)
      .reply(500);

    const { result } = renderHook(() => useSummerVoucherConfigurationQuery(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockErrorHandler).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });
});
