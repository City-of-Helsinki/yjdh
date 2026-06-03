import { act, renderHook } from '@testing-library/react-hooks';
import { useRouter } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import Application from 'shared/types/application';

import useCreateApplicationQuery from '../useCreateApplicationQuery';

jest.mock('shared/hooks/useBackendAPI');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

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

describe('useCreateApplicationQuery', () => {
  let mockPost: jest.Mock;
  let mockHandleResponse: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPost = jest.fn();
    mockHandleResponse = jest.fn((promise) => promise);
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        post: mockPost,
      },
      handleResponse: mockHandleResponse,
    });

    (useRouter as jest.Mock).mockReturnValue({
      defaultLocale: 'sv',
    });
  });

  it('calls post with language SV and sets query cache on success', async () => {
    const { queryClient, wrapper } = createWrapper();
    const setQueryDataSpy = jest.spyOn(queryClient, 'setQueryData');
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const mockApp = { id: 'new-app-id', language: 'sv' } as Application;
    mockPost.mockResolvedValue(mockApp);

    const { result } = renderHook(() => useCreateApplicationQuery(), {
      wrapper,
    });

    let data: Application | undefined;
    await act(async () => {
      data = await result.current.mutateAsync();
    });

    expect(mockPost).toHaveBeenCalledWith('/v1/employerapplications/', {
      language: 'sv',
    });
    expect(data).toEqual(mockApp);

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      '/v1/employerapplications/new-app-id/',
      mockApp
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      '/v1/employerapplications/'
    );
  });

  it('throws an error if id is missing in the created application response', async () => {
    const { wrapper } = createWrapper();

    const mockAppWithoutId = { language: 'sv' } as Application;
    mockPost.mockResolvedValue(mockAppWithoutId);

    const { result } = renderHook(() => useCreateApplicationQuery(), {
      wrapper,
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync();
      })
    ).rejects.toThrow('Missing id');
  });

  it('uses default locale fallback (fi) if defaultLocale is missing on router', async () => {
    (useRouter as jest.Mock).mockReturnValue({});
    const { wrapper } = createWrapper();

    const mockApp = { id: 'new-app-id', language: 'fi' } as Application;
    mockPost.mockResolvedValue(mockApp);

    const { result } = renderHook(() => useCreateApplicationQuery(), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockPost).toHaveBeenCalledWith('/v1/employerapplications/', {
      language: 'fi',
    });
  });
});
