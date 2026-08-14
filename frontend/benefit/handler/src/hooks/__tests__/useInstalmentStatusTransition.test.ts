import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { INSTALMENT_STATUSES } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useInstalmentStatusTransition from '../useInstalmentStatusTransition';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useInstalmentStatusTransition', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: {
    id: string;
    status: INSTALMENT_STATUSES;
  }) => unknown;
  let capturedOnSuccess: () => void;
  let capturedOnError: (error: Error) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnSuccess = options.onSuccess;
      capturedOnError = options.onError;
      return { mutate: jest.fn() };
    });

    renderHook(() => useInstalmentStatusTransition());
  });

  it('calls the instalment status transition endpoint with status', () => {
    handleResponse.mockReturnValue(Promise.resolve(null));
    axios.patch.mockReturnValue({});

    capturedMutationFn({
      id: 'inst-1',
      status: INSTALMENT_STATUSES.COMPLETED,
    });

    expect(axios.patch).toHaveBeenCalledWith(
      HandlerEndpoint.HANDLER_INSTALMENT_STATUS_TRANSITION('inst-1'),
      { status: INSTALMENT_STATUSES.COMPLETED }
    );
  });

  it('invalidates all relevant query keys on success', () => {
    capturedOnSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
  });

  it('shows error toast on error', () => {
    capturedOnError(new Error('transition error'));

    expect(showErrorToast).toHaveBeenCalled();
  });
});
