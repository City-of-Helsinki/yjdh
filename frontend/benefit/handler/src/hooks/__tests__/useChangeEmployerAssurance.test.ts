import { renderHook } from '@testing-library/react-hooks';
import { useMutation, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useChangeEmployerAssurance from '../useChangeEmployerAssurance';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useChangeEmployerAssurance', () => {
  const handleResponse = jest.fn();
  const patch = jest.fn();
  const cancelQueries = jest.fn();
  const getQueryData = jest.fn();
  const setQueryData = jest.fn();
  const invalidateQueries = jest.fn();

  let mutationOptions: {
    onMutate?: (variables: {
      id: string;
      employerAssurance: boolean;
    }) => Promise<unknown> | unknown;
    onSuccess?: (
      data: null,
      variables: { id: string; employerAssurance: boolean },
      context?: unknown
    ) => void | Promise<void>;
    onError?: (
      error: unknown,
      variables: { id: string; employerAssurance: boolean },
      context?: unknown
    ) => void;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: { patch },
      handleResponse,
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      cancelQueries,
      getQueryData,
      setQueryData,
      invalidateQueries,
    });

    mutationOptions = {};

    (useMutation as jest.Mock).mockImplementation(
      (_key, _mutationFn, options) => {
        mutationOptions = options;
        return {
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
        };
      }
    );
  });

  it('optimistically updates cache on mutate', async () => {
    getQueryData.mockImplementation((queryKey: unknown) => {
      if (Array.isArray(queryKey) && queryKey[0] === 'application') {
        return { id: 'application-id', employerAssurance: false };
      }

      if (queryKey === 'applications') {
        return [{ id: 'application-id', employerAssurance: false }];
      }

      return null;
    });

    renderHook(() => useChangeEmployerAssurance());

    const context = await mutationOptions.onMutate?.({
      id: 'application-id',
      employerAssurance: true,
    });

    expect(cancelQueries).toHaveBeenCalledWith('application');
    expect(cancelQueries).toHaveBeenCalledWith('applications');

    expect(setQueryData).toHaveBeenCalledWith(
      ['application', 'application-id'],
      expect.any(Function)
    );
    expect(setQueryData).toHaveBeenCalledWith(
      'applications',
      expect.any(Function)
    );

    expect(context).toEqual({
      previousApplication: { id: 'application-id', employerAssurance: false },
      previousApplications: [
        { id: 'application-id', employerAssurance: false },
      ],
    });
  });

  it('invalidates queries on success', async () => {
    renderHook(() => useChangeEmployerAssurance());

    await mutationOptions.onSuccess?.(
      null,
      { id: 'application-id', employerAssurance: true }
    );

    expect(invalidateQueries).toHaveBeenCalledWith('applications');
    expect(invalidateQueries).toHaveBeenCalledWith([
      'application',
      'application-id',
    ]);
  });

  it('restores cache and shows error toast on error', () => {
    renderHook(() => useChangeEmployerAssurance());

    mutationOptions.onError?.(
      new Error('boom'),
      { id: 'application-id', employerAssurance: true },
      {
        previousApplication: { id: 'application-id', employerAssurance: false },
        previousApplications: [
          { id: 'application-id', employerAssurance: false },
        ],
      }
    );

    expect(setQueryData).toHaveBeenCalledWith(
      ['application', 'application-id'],
      { id: 'application-id', employerAssurance: false }
    );
    expect(setQueryData).toHaveBeenCalledWith('applications', [
      { id: 'application-id', employerAssurance: false },
    ]);
    expect(showErrorToast).toHaveBeenCalledWith(
      'common:error.employerAssurance.label',
      'common:error.employerAssurance.text'
    );
  });
});
