import {
  InvalidateQueryFilters,
  Query,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useDeleteApplicationQuery from '../useDeleteApplicationQuery';

jest.mock('shared/hooks/useBackendAPI');

const createWrapper = (): {
  queryClient: QueryClient;
  wrapper: React.FC<{ children: React.ReactNode }>;
} => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('useDeleteApplicationQuery', () => {
  let mockDelete: jest.Mock;
  let mockHandleResponse: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete = jest.fn();
    mockHandleResponse = jest.fn((promise) => promise);
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        delete: mockDelete,
      },
      handleResponse: mockHandleResponse,
    });
  });

  it('calls delete endpoint and invalidates queries on success', async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    mockDelete.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useDeleteApplicationQuery(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync('app-123');
    });

    expect(mockDelete).toHaveBeenCalledWith(
      '/v1/employerapplications/app-123/'
    );
    expect(mockHandleResponse).toHaveBeenCalledTimes(1);

    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    const options = invalidateSpy.mock.calls[0][0] as InvalidateQueryFilters;
    expect(options).toBeDefined();
    const predicate = options?.predicate;
    expect(predicate).toBeDefined();

    if (predicate) {
      expect(
        predicate({ queryKey: '/v1/employerapplications/' } as unknown as Query)
      ).toBe(true);
      expect(predicate({ queryKey: '/v1/other/' } as unknown as Query)).toBe(
        false
      );

      expect(
        predicate({
          queryKey: ['/v1/employerapplications/', 'detail'],
        } as unknown as Query)
      ).toBe(true);
      expect(
        predicate({ queryKey: ['/v1/other/', 'detail'] } as unknown as Query)
      ).toBe(false);

      expect(predicate({ queryKey: {} } as unknown as Query)).toBe(false);
    }
  });
});
