import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
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

const createErrorContext = (): {
  previousApplication: { id: string; employerAssurance: boolean };
  previousApplications: Array<{ id: string; employerAssurance: boolean }>;
} => ({
  previousApplication: { id: 'application-id', employerAssurance: false },
  previousApplications: [{ id: 'application-id', employerAssurance: false }],
});

describe('useChangeEmployerAssurance', () => {
  const handleResponse = jest.fn();
  const patch = jest.fn();
  const cancelQueries = jest.fn();
  const getQueryData = jest.fn();
  const setQueryData = jest.fn();
  const invalidateQueries = jest.fn();
  const mutationFn = jest.fn();

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
      (_key, passedMutationFn, options) => {
        mutationFn.mockImplementation(passedMutationFn);
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

  it('calls backend patch endpoint and wraps response in handleResponse', async () => {
    const patchResponse = { data: null };
    patch.mockReturnValue(patchResponse);
    handleResponse.mockResolvedValue(null);

    renderHook(() => useChangeEmployerAssurance());

    await mutationFn({ id: 'application-id', employerAssurance: true });

    expect(patch).toHaveBeenCalledWith(
      HandlerEndpoint.HANDLER_CHANGE_EMPLOYER_ASSURANCE('application-id'),
      { employerAssurance: true }
    );
    expect(handleResponse).toHaveBeenCalledWith(patchResponse);
  });

  it('updates application cache updater for object and non-object values', async () => {
    renderHook(() => useChangeEmployerAssurance());

    await mutationOptions.onMutate?.({
      id: 'application-id',
      employerAssurance: true,
    });

    const applicationUpdateCall = setQueryData.mock.calls.find(
      ([queryKey]: [unknown]) =>
        Array.isArray(queryKey) && queryKey[0] === 'application'
    );

    const applicationUpdater = applicationUpdateCall?.[1] as
      | ((current: unknown) => unknown)
      | undefined;

    expect(applicationUpdater).toEqual(expect.any(Function));
    expect(
      applicationUpdater?.({ id: 'application-id', employerAssurance: false })
    ).toEqual({ id: 'application-id', employerAssurance: true });
    expect(applicationUpdater?.('not-an-object')).toBe('not-an-object');
  });

  it('updates applications list updater for array and non-array values', async () => {
    renderHook(() => useChangeEmployerAssurance());

    await mutationOptions.onMutate?.({
      id: 'application-id',
      employerAssurance: true,
    });

    const applicationsUpdateCall = setQueryData.mock.calls.find(
      ([queryKey]: [unknown]) => queryKey === 'applications'
    );

    const applicationsUpdater = applicationsUpdateCall?.[1] as
      | ((current: unknown) => unknown)
      | undefined;

    expect(applicationsUpdater).toEqual(expect.any(Function));
    expect(applicationsUpdater?.('not-an-array')).toBe('not-an-array');
    expect(
      applicationsUpdater?.([
        { id: 'application-id', employerAssurance: false },
        { id: 'other-id', employerAssurance: false },
      ])
    ).toEqual([
      { id: 'application-id', employerAssurance: true },
      { id: 'other-id', employerAssurance: false },
    ]);
  });

  it('invalidates queries on success', async () => {
    renderHook(() => useChangeEmployerAssurance());

    await mutationOptions.onSuccess?.(null, {
      id: 'application-id',
      employerAssurance: true,
    });

    expect(invalidateQueries).toHaveBeenCalledWith('applications');
    expect(invalidateQueries).toHaveBeenCalledWith([
      'application',
      'application-id',
    ]);
  });

  it.each<[string, unknown]>([
    ['with context', createErrorContext()],
    ['without context', undefined],
  ])('shows error toast on error %s', (_description, context) => {
    renderHook(() => useChangeEmployerAssurance());

    mutationOptions.onError?.(
      new Error('boom'),
      { id: 'application-id', employerAssurance: true },
      context
    );

    if (context) {
      expect(setQueryData).toHaveBeenCalledWith(
        ['application', 'application-id'],
        { id: 'application-id', employerAssurance: false }
      );
      expect(setQueryData).toHaveBeenCalledWith('applications', [
        { id: 'application-id', employerAssurance: false },
      ]);
    } else {
      expect(setQueryData).not.toHaveBeenCalled();
    }

    expect(showErrorToast).toHaveBeenCalledWith(
      'Virhe työnantajan vakuutuksen muuttamisessa',
      'Ole hyvä ja kokeile myöhemmin uudestaan.'
    );
  });
});
