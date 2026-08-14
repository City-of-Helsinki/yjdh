import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApproveTermsOfServiceMutation from '../useApproveTermsOfServiceMutation';

const getHookConfig = (): {
  mutationFn: (user: {
    termsOfServiceInEffect: {
      id: string;
      applicantConsents: Array<{ id: string }>;
    };
  }) => Promise<unknown>;
} =>
  renderHook(() => useApproveTermsOfServiceMutation()).result
    .current as unknown as {
    mutationFn: (user: {
      termsOfServiceInEffect: {
        id: string;
        applicantConsents: Array<{ id: string }>;
      };
    }) => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useApproveTermsOfServiceMutation', () => {
  const mockPost = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        post: mockPost,
      },
      handleResponse: mockHandleResponse,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('posts terms id and consent ids to approve terms endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({
      termsOfServiceInEffect: {
        id: 'terms-1',
        applicantConsents: [{ id: 'consent-1' }, { id: 'consent-2' }],
      },
    });

    expect(mockPost).toHaveBeenCalledWith(
      BackendEndpoint.APPROVE_TERMS_OF_SERVICE,
      {
        terms: 'terms-1',
        selected_applicant_consents: ['consent-1', 'consent-2'],
      }
    );
  });
});
