import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import nock from 'nock';
import React from 'react';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';

import useCreateAdditionalInfoQuery from '../useCreateAdditionalInfoQuery';

const API_BASE_TEST_URL = 'http://kesaseteli-api';

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('shared/hooks/useGetLanguage', () => () => () => 'fi');
jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

describe('useCreateAdditionalInfoQuery', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL={API_BASE_TEST_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BackendAPIProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
  });

  it('calls onSuccess when additional info created successfully', async () => {
    const mockOnSuccess = jest.fn();
    const applicationId = 'app-123';

    nock(API_BASE_TEST_URL)
      .post(`/v1/youthapplications/${applicationId}/additional_info/`)
      .reply(200, { id: 'info-123' });

    const { result } = renderHook(
      () =>
        useCreateAdditionalInfoQuery(applicationId, {
          onSuccess: mockOnSuccess,
        }),
      { wrapper }
    );

    act(() => {
      result.current.mutate({
        additional_info_user_reasons: ['reason_1'],
        additional_info_description: 'Description text',
      } as unknown as AdditionalInfoFormData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
