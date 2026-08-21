import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import i18n from '../../../test/i18n/i18n-test';
import useUpdateApplicationQuery from '../useUpdateApplicationQuery';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: i18n.t.bind(i18n),
  }),
}));

jest.mock('shared/components/toast/show-error-toast');
jest.mock('shared/hooks/useBackendAPI');

describe('useUpdateApplicationQuery', () => {
  const mockPut = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockInvalidateQueries = jest.fn();

  const renderUseUpdateApplicationQuery = (
    setIsSubmittedApplication?: jest.Mock
  ): ReturnType<typeof renderHook> =>
    renderHook(() => useUpdateApplicationQuery(setIsSubmittedApplication));

  const getHookConfig = (
    setIsSubmittedApplication?: jest.Mock
  ): {
    mutationFn: (args: { id: string }) => Promise<unknown>;
    onSuccess: (data: { status?: string }) => void;
    onError: () => void;
  } =>
    renderUseUpdateApplicationQuery(setIsSubmittedApplication).result
      .current as {
      mutationFn: (args: { id: string }) => Promise<unknown>;
      onSuccess: (data: { status?: string }) => void;
      onError: () => void;
    };

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        put: mockPut,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('updates application via put and invalidates related query keys on success', async () => {
    mockPut.mockResolvedValue({ data: {} });
    const setIsSubmittedApplication = jest.fn();
    const mutationConfig = getHookConfig(setIsSubmittedApplication);

    await mutationConfig.mutationFn({ id: 'app-1' });
    expect(mockPut).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/`,
      { id: 'app-1' }
    );

    mutationConfig.onSuccess({ status: APPLICATION_STATUSES.HANDLING });
    expect(setIsSubmittedApplication).toHaveBeenCalledWith(true);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
  });

  it('does not toggle submitted flag for non-submitted statuses', () => {
    const setIsSubmittedApplication = jest.fn();
    const mutationConfig = getHookConfig(setIsSubmittedApplication);

    mutationConfig.onSuccess({ status: APPLICATION_STATUSES.DRAFT });

    expect(setIsSubmittedApplication).not.toHaveBeenCalled();
  });

  it('shows generic error toast on mutation error', () => {
    const mutationConfig = getHookConfig();

    mutationConfig.onError();

    expect(showErrorToast).toHaveBeenCalledWith(
      i18n.t('common:error.generic.label'),
      i18n.t('common:error.generic.text')
    );
  });
});
