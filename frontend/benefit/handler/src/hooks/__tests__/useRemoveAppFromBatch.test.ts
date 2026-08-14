import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useRemoveAppFromBatch from '../useRemoveAppFromBatch';

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

describe('useRemoveAppFromBatch', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  const setBatchCloseAnimation = jest.fn();
  let capturedMutationFn: (payload: {
    appIds: string[];
    batchId: string;
  }) => unknown;
  let capturedOnSuccess: (response: { remainingApps: number }) => void;
  let capturedOnError: () => void;

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

    renderHook(() => useRemoveAppFromBatch(setBatchCloseAnimation));
  });

  it('calls the batch deassign endpoint with appIds and batchId', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.patch.mockReturnValue({});

    capturedMutationFn({ appIds: ['app-1'], batchId: 'batch-1' });

    expect(axios.patch).toHaveBeenCalledWith(
      HandlerEndpoint.BATCH_APP_DEASSIGN('batch-1'),
      { application_ids: ['app-1'] }
    );
  });

  it('triggers animation and delayed invalidation when remainingApps is 0', () => {
    jest.useFakeTimers();

    capturedOnSuccess({ remainingApps: 0 });

    expect(setBatchCloseAnimation).toHaveBeenCalledWith(true);
    expect(showSuccessToast).toHaveBeenCalled();
    expect(invalidateQueries).not.toHaveBeenCalled();

    jest.advanceTimersByTime(700);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });

    jest.useRealTimers();
  });

  it('invalidates immediately and shows success toast when apps remain', () => {
    capturedOnSuccess({ remainingApps: 2 });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });
    expect(showSuccessToast).toHaveBeenCalled();
    expect(setBatchCloseAnimation).not.toHaveBeenCalledWith(true);
  });

  it('resets animation and shows error toast on error', () => {
    capturedOnError();

    expect(setBatchCloseAnimation).toHaveBeenCalledWith(false);
    expect(showErrorToast).toHaveBeenCalled();
  });
});
