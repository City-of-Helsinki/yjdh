import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useChangeHandlerMutation from '../useChangeHandlerMutation';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useChangeHandlerMutation', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (id: string) => unknown;
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

    renderHook(() => useChangeHandlerMutation());
  });

  it('calls the change-handler endpoint with the application id', () => {
    handleResponse.mockReturnValue(Promise.resolve(null));
    axios.patch.mockReturnValue({});

    capturedMutationFn('app-123');

    expect(axios.patch).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_APPLICATIONS}app-123/change-handler/`
    );
  });

  it('invalidates applications and application queries on success', () => {
    capturedOnSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
  });

  it('shows error toast on error', () => {
    capturedOnError(new Error('handler change error'));

    expect(showErrorToast).toHaveBeenCalled();
  });
});
