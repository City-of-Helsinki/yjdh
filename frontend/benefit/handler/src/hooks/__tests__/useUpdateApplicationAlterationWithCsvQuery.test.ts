import '@testing-library/jest-dom';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useUpdateApplicationAlterationWithCsvQuery from '../useUpdateApplicationAlterationWithCsvQuery';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

describe('useUpdateApplicationAlterationWithCsvQuery', () => {
  const axios = { patch: jest.fn() };
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: {
    id: string;
    applicationId: string;
    data: Record<string, unknown>;
  }) => unknown;
  let capturedOnSuccess: (
    _: unknown,
    variables: { applicationId: string }
  ) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({
      axios,
      handleResponse: jest.fn(),
    });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnSuccess = options.onSuccess;
      return { mutate: jest.fn() };
    });

    renderHook(() => useUpdateApplicationAlterationWithCsvQuery());
  });

  it('calls the csv update endpoint with correct params', async () => {
    const mockBlob = new Blob(['csv'], { type: 'text/csv' });
    axios.patch.mockResolvedValue({ data: mockBlob });

    await capturedMutationFn({
      id: 'alt-1',
      applicationId: 'app-1',
      data: { state: 'cancelled' },
    });

    const expectedEndpoint = `${BackendEndpoint.HANDLER_APPLICATION_ALTERATION_UPDATE_WITH_CSV}?application_id=app-1&alteration_id=alt-1`;
    expect(axios.patch).toHaveBeenCalledWith(
      expectedEndpoint,
      { state: 'cancelled' },
      expect.objectContaining({
        responseType: 'blob',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('throws when the response data is not a Blob', async () => {
    axios.patch.mockResolvedValue({ data: 'not a blob' });

    await expect(
      capturedMutationFn({ id: 'alt-1', applicationId: 'app-1', data: {} })
    ).rejects.toThrow('Unexpected response type');
  });

  it('invalidates the application query on success', () => {
    capturedOnSuccess(undefined, { applicationId: 'app-1' });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications', 'app-1'],
    });
  });
});
