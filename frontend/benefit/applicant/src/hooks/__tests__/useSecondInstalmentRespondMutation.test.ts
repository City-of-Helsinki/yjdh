import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ApplicantEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useSecondInstalmentRespondMutation from '../useSecondInstalmentRespondMutation';

const getHookConfig = (): {
  mutationFn: (params: { applicationId: string }) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
} =>
  renderHook(() => useSecondInstalmentRespondMutation()).result
    .current as unknown as {
    mutationFn: (params: { applicationId: string }) => Promise<unknown>;
    onSuccess: () => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useSecondInstalmentRespondMutation', () => {
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

  it('posts to second-instalment respond endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({ applicationId: 'app-1' });

    expect(mockPost).toHaveBeenCalledWith(
      ApplicantEndpoint.SECOND_INSTALMENT_RESPOND('app-1')
    );
  });

  it('invalidates applications and application queries on success', async () => {
    mockInvalidateQueries.mockImplementation(async () => null);
    const hookConfig = getHookConfig();

    await hookConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
  });
});
