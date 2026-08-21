import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApplicationToBatch from '../useApplicationToBatch';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());
jest.mock('shared/components/toast/show-success-toast', () => jest.fn());

describe('useApplicationToBatch', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: {
    applicationIds: string[];
    status: APPLICATION_STATUSES;
  }) => unknown;
  let capturedOnSuccess: (
    _: unknown,
    variables: { applicationIds: string[] }
  ) => void;
  let capturedOnError: (error: unknown) => void;

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

    renderHook(() => useApplicationToBatch());
  });

  it('calls the batch assign endpoint with applicationIds and status', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.patch.mockReturnValue({});

    capturedMutationFn({
      applicationIds: ['app-1', 'app-2'],
      status: APPLICATION_STATUSES.ACCEPTED,
    });

    expect(axios.patch).toHaveBeenCalledWith(HandlerEndpoint.BATCH_APP_ASSIGN, {
      application_ids: ['app-1', 'app-2'],
      status: APPLICATION_STATUSES.ACCEPTED,
    });
  });

  it('shows success toast and invalidates queries on success', () => {
    capturedOnSuccess(undefined, { applicationIds: ['app-1', 'app-2'] });

    expect(showSuccessToast).toHaveBeenCalled();
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });
  });

  it('shows error toast with errorKey-specific message when errorKey exists', () => {
    const error = {
      response: { data: { errorKey: 'locked' } },
    };

    capturedOnError(error);

    expect(showErrorToast).toHaveBeenCalled();
  });

  it('shows generic error toast when error has no errorKey', () => {
    capturedOnError(new Error('unknown'));

    expect(showErrorToast).toHaveBeenCalled();
  });
});
