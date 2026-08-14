import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useBatchStatus from '../useBatchStatus';

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

describe('useBatchStatus', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: {
    id: string;
    status: BATCH_STATUSES;
  }) => unknown;
  let capturedOnSuccess: (response: {
    status: BATCH_STATUSES;
    previousStatus: BATCH_STATUSES;
  }) => void;
  let capturedOnError: (
    e: { response?: { data?: { errorKey?: string } } },
    variables: { status: BATCH_STATUSES }
  ) => void;

  const setupMocks = (setBatchCloseAnimation?: jest.Mock): void => {
    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnSuccess = options.onSuccess;
      capturedOnError = options.onError;
      return { mutate: jest.fn() };
    });

    renderHook(() => useBatchStatus(setBatchCloseAnimation));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the batch status change endpoint with id and status', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.patch.mockReturnValue({});

    setupMocks();

    capturedMutationFn({
      id: 'batch-1',
      status: BATCH_STATUSES.AWAITING_FOR_DECISION,
    });

    expect(axios.patch).toHaveBeenCalledWith(
      HandlerEndpoint.BATCH_STATUS_CHANGE('batch-1'),
      { status: BATCH_STATUSES.AWAITING_FOR_DECISION }
    );
  });

  it('shows success toast on success', () => {
    setupMocks();

    capturedOnSuccess({
      status: BATCH_STATUSES.AWAITING_FOR_DECISION,
      previousStatus: BATCH_STATUSES.DRAFT,
    });

    expect(showSuccessToast).toHaveBeenCalled();
  });

  it('invalidates applicationsList on success', () => {
    setupMocks();

    capturedOnSuccess({
      status: BATCH_STATUSES.DRAFT,
      previousStatus: BATCH_STATUSES.DRAFT,
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });
  });

  it('triggers animation and delayed invalidation when previous status is AWAITING_FOR_DECISION', () => {
    jest.useFakeTimers();
    const setBatchCloseAnimation = jest.fn();

    setupMocks(setBatchCloseAnimation);

    capturedOnSuccess({
      status: BATCH_STATUSES.DRAFT,
      previousStatus: BATCH_STATUSES.AWAITING_FOR_DECISION,
    });

    expect(setBatchCloseAnimation).toHaveBeenCalledWith(true);
    expect(invalidateQueries).not.toHaveBeenCalled();

    jest.advanceTimersByTime(700);
    expect(invalidateQueries).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('shows error toast with generic message on error without errorKey', () => {
    setupMocks();

    capturedOnError({ response: undefined }, { status: BATCH_STATUSES.DRAFT });

    expect(showErrorToast).toHaveBeenCalled();
  });

  it('shows error toast with errorKey-specific message on error with errorKey', () => {
    setupMocks();

    capturedOnError(
      {
        response: {
          data: { errorKey: 'locked' },
        },
      },
      { status: BATCH_STATUSES.DRAFT }
    );

    expect(showErrorToast).toHaveBeenCalled();
  });
});
