import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import {
  ApplicantEndpoint,
  BackendEndpoint,
} from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import i18n from '../../../test/i18n/i18n-test';
import useCloneApplicationMutation from '../useCloneApplicationMutation';

const renderUseCloneApplicationMutation = (): ReturnType<typeof renderHook> =>
  renderHook(() => useCloneApplicationMutation());

const getHookConfig = (): {
  mutationFn: (id?: string) => Promise<unknown>;
  onError: (error: { response?: { status?: number } }) => void;
} =>
  renderUseCloneApplicationMutation().result.current as {
    mutationFn: (id?: string) => Promise<unknown>;
    onError: (error: { response?: { status?: number } }) => void;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: i18n.t.bind(i18n),
  }),
}));

jest.mock('shared/components/toast/show-error-toast');
jest.mock('shared/hooks/useBackendAPI');

describe('useCloneApplicationMutation', () => {
  const mockGet = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        get: mockGet,
      },
      handleResponse: mockHandleResponse,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('uses clone-by-id endpoint when id is provided', async () => {
    mockGet.mockResolvedValue({ data: {} });
    const mutationConfig = getHookConfig();

    await mutationConfig.mutationFn('app-123');

    expect(mockGet).toHaveBeenCalledWith(
      ApplicantEndpoint.APPLICATIONS_CLONE_AS_DRAFT('app-123')
    );
  });

  it('uses clone-latest endpoint when id is not provided', async () => {
    mockGet.mockResolvedValue({ data: {} });
    const mutationConfig = getHookConfig();

    await mutationConfig.mutationFn();

    expect(mockGet).toHaveBeenCalledWith(
      BackendEndpoint.APPLICATIONS_CLONE_LATEST
    );
  });

  it('shows translated toast when clone fails with 404', () => {
    const mutationConfig = getHookConfig();

    mutationConfig.onError({ response: { status: 404 } });

    expect(showErrorToast).toHaveBeenCalledWith(
      i18n.t('common:applications.errors.cloneError.title'),
      i18n.t('common:applications.errors.cloneError.message')
    );
  });

  it('shows fallback toast when clone fails with non-404 status', () => {
    const mutationConfig = getHookConfig();

    mutationConfig.onError({ response: { status: 500 } });

    expect(showErrorToast).toHaveBeenCalledWith(
      'Error cloning application',
      ''
    );
  });
});
