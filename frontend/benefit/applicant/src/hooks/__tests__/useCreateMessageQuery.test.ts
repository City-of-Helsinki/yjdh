import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MESSAGE_URLS } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import i18n from '../../../test/i18n/i18n-test';
import useCreateMessageQuery from '../useCreateMessageQuery';

const getHookConfig = (): {
  mutationFn: (message: { body?: string }) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
  onError: () => void;
} =>
  renderHook(() => useCreateMessageQuery('app-1', MESSAGE_URLS.MESSAGES)).result
    .current as unknown as {
    mutationFn: (message: { body?: string }) => Promise<unknown>;
    onSuccess: () => Promise<unknown>;
    onError: () => void;
  };

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

describe('useCreateMessageQuery', () => {
  const mockPost = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        post: mockPost,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('posts message to application message endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({ body: 'hello' });

    expect(mockPost).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/${MESSAGE_URLS.MESSAGES}`,
      { body: 'hello' }
    );
  });

  it('invalidates messages query on success', async () => {
    mockInvalidateQueries.mockImplementation(async () => null);
    const hookConfig = getHookConfig();

    await hookConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['messages'],
    });
  });

  it('shows translated create error toast on error', () => {
    const hookConfig = getHookConfig();

    hookConfig.onError();

    expect(showErrorToast).toHaveBeenCalledWith(
      i18n.t('common:messenger.list.errors.create.label'),
      i18n.t('common:messenger.list.errors.create.text')
    );
  });
});
