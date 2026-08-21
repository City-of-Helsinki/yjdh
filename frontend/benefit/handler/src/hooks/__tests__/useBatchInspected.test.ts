import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useBatchInspected from '../useBatchInspected';

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

describe('useBatchInspected', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: {
    id: string;
    status: BATCH_STATUSES;
    form?: Record<string, unknown>;
  }) => unknown;
  let capturedOnSuccess: (response: {
    status: BATCH_STATUSES;
    decision: PROPOSALS_FOR_DECISION;
  }) => void;
  let capturedOnError: () => void;

  const setupMocks = (setBatchCloseAnimation?: jest.Mock): void => {
    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnSuccess = options.onSuccess;
      capturedOnError = options.onError;
      return { mutate: jest.fn() };
    });

    renderHook(() => useBatchInspected(setBatchCloseAnimation, 3));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the batch status change endpoint with id and status', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.patch.mockReturnValue({});

    setupMocks();

    capturedMutationFn({ id: 'batch-1', status: BATCH_STATUSES.COMPLETED });

    expect(axios.patch).toHaveBeenCalledWith(
      HandlerEndpoint.BATCH_STATUS_CHANGE('batch-1'),
      expect.objectContaining({ status: BATCH_STATUSES.COMPLETED })
    );
  });

  it('formats the decision_date from d.M.yyyy to yyyy-MM-dd', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.patch.mockReturnValue({});

    setupMocks();

    capturedMutationFn({
      id: 'batch-1',
      status: BATCH_STATUSES.COMPLETED,
      form: {
        decision_date: '5.3.2025',
        decision_maker_name: 'Test',
        decision_maker_title: 'Title',
        section_of_the_law: '§1',
        expert_inspector_name: 'Expert',
        expert_inspector_title: 'E.Title',
        p2p_inspector_name: 'P2P',
        p2p_inspector_email: 'p2p@test.fi',
        p2p_checker_name: 'Checker',
      } as never,
    });

    expect(axios.patch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ decision_date: '2025-03-05' })
    );
  });

  it('shows success toast on success', () => {
    setupMocks();

    capturedOnSuccess({
      status: BATCH_STATUSES.DRAFT,
      decision: PROPOSALS_FOR_DECISION.ACCEPTED,
    });

    expect(showSuccessToast).toHaveBeenCalled();
  });

  it('triggers animation and delayed invalidation on COMPLETED status', () => {
    jest.useFakeTimers();
    const setBatchCloseAnimation = jest.fn();

    setupMocks(setBatchCloseAnimation);

    capturedOnSuccess({
      status: BATCH_STATUSES.COMPLETED,
      decision: PROPOSALS_FOR_DECISION.ACCEPTED,
    });

    expect(setBatchCloseAnimation).toHaveBeenCalledWith(true);
    expect(invalidateQueries).not.toHaveBeenCalled();

    jest.advanceTimersByTime(700);
    expect(invalidateQueries).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('invalidates immediately for non-terminal statuses', () => {
    setupMocks();

    capturedOnSuccess({
      status: BATCH_STATUSES.DRAFT,
      decision: PROPOSALS_FOR_DECISION.ACCEPTED,
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });
  });

  it('shows error toast on error', () => {
    setupMocks();

    capturedOnError();

    expect(showErrorToast).toHaveBeenCalled();
  });
});
