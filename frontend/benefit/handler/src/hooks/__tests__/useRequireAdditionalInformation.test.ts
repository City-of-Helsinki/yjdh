import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useRequireAdditionalInformation from '../useRequireAdditionalInformation';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useRequireAdditionalInformation', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: {
    id: string;
    status: APPLICATION_STATUSES;
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

    renderHook(() => useRequireAdditionalInformation());
  });

  it('calls the require additional information endpoint with status', () => {
    handleResponse.mockReturnValue(Promise.resolve(null));
    axios.patch.mockReturnValue({});

    capturedMutationFn({
      id: 'app-1',
      status: APPLICATION_STATUSES.INFO_REQUIRED,
    });

    expect(axios.patch).toHaveBeenCalledWith(
      HandlerEndpoint.HANDLER_REQUIRE_ADDITIONAL_INFORMATION('app-1'),
      { status: APPLICATION_STATUSES.INFO_REQUIRED }
    );
  });

  it('invalidates all relevant query keys on success', () => {
    capturedOnSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['messages'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
  });

  it('shows error toast on error', () => {
    capturedOnError(new Error('info error'));

    expect(showErrorToast).toHaveBeenCalled();
  });
});
