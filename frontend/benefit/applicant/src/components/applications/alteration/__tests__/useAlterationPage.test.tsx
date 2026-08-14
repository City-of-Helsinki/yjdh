import { renderHook, waitFor } from '@testing-library/react';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useRouter } from 'next/router';

import useAlterationPage from '../useAlterationPage';

const setApplicationQueryResult = (
  overrides: Partial<{
    status: string;
    data: { id: string; application_number: number } | null;
    error: Error | null;
  }> = {}
): void => {
  (useApplicationQuery as jest.Mock).mockReturnValue({
    status: 'success',
    data: {
      id: '123',
      application_number: 456,
    },
    error: null,
    ...overrides,
  });
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('benefit/applicant/hooks/useApplicationQuery');

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useAlterationPage', () => {
  const mockRouter = {
    query: { id: '123' },
    isReady: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    setApplicationQueryResult();
  });

  it('returns parsed id and camel-cased application data', async () => {
    const { result } = renderHook(() => useAlterationPage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.id).toBe('123');
    expect(result.current.application).toEqual(
      expect.objectContaining({
        id: '123',
        applicationNumber: 456,
      })
    );
    expect(result.current.isError).toBe(false);
  });

  it('keeps loading while application query is pending', () => {
    setApplicationQueryResult({
      status: 'pending',
      data: null,
    });

    const { result } = renderHook(() => useAlterationPage());

    expect(result.current.isLoading).toBe(true);
  });

  it('stops loading when router is ready but id is missing', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      isReady: true,
    });
    setApplicationQueryResult({
      status: 'pending',
      data: null,
    });

    const { result } = renderHook(() => useAlterationPage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.id).toBe('');
    expect(result.current.application).toBeNull();
  });

  it('marks error state when application query returns an error', async () => {
    setApplicationQueryResult({
      data: null,
      error: new Error('request failed'),
    });

    const { result } = renderHook(() => useAlterationPage());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
  });
});
