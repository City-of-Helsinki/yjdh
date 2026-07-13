import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import { NoteTargetType } from '../../../types/note';
import useDeleteNoteMutation from '../useDeleteNoteMutation';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// SonarCloud: Dummy URL used only as a base for mocking requests with nock in unit tests.
const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';
const TEST_TARGET_ID = 'abc-123';
const TEST_TARGET_TYPE = NoteTargetType.YOUTH_APPLICATION;

describe('useDeleteNoteMutation', () => {
  const axios = createAxiosTestContext(API_BASE_TEST_URL);
  const queryClient = createReactQueryTestClient(axios, API_BASE_TEST_URL);
  const mockErrorHandler = jest.fn();

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL={API_BASE_TEST_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BackendAPIProvider>
  );

  beforeAll(() => {
    nock.disableNetConnect();
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
    (useErrorHandler as jest.Mock).mockReturnValue(mockErrorHandler);
    jest.clearAllMocks();
  });

  it('deletes note successfully and invalidates queries', async () => {
    const noteId = 'note-to-delete';

    nock(API_BASE_TEST_URL)
      .delete(`${BackendEndpoint.HANDLER_NOTES}${noteId}/`)
      .reply(204);

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useDeleteNoteMutation(TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );

    await result.current.mutateAsync(noteId);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_NOTES}?target_type=${TEST_TARGET_TYPE}&target_id=${TEST_TARGET_ID}`
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      `${BackendEndpoint.YOUTH_APPLICATIONS}${TEST_TARGET_ID}/timeline/`
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      `${BackendEndpoint.EMPLOYER_APPLICATIONS}${TEST_TARGET_ID}/timeline/`
    );
    expect(nock.isDone()).toBe(true);
  });

  it('calls options.onSuccess and invalidates queries', async () => {
    const noteId = 'note-to-delete';
    const mockOnSuccess = jest.fn();

    nock(API_BASE_TEST_URL)
      .delete(`${BackendEndpoint.HANDLER_NOTES}${noteId}/`)
      .reply(204);

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () =>
        useDeleteNoteMutation(TEST_TARGET_TYPE, TEST_TARGET_ID, {
          onSuccess: mockOnSuccess,
        }),
      { wrapper }
    );

    await result.current.mutateAsync(noteId);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_NOTES}?target_type=${TEST_TARGET_TYPE}&target_id=${TEST_TARGET_ID}`
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      `${BackendEndpoint.YOUTH_APPLICATIONS}${TEST_TARGET_ID}/timeline/`
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith(
      `${BackendEndpoint.EMPLOYER_APPLICATIONS}${TEST_TARGET_ID}/timeline/`
    );
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });

  it('calls useErrorHandler on failure', async () => {
    const noteId = 'note-to-delete';

    nock(API_BASE_TEST_URL)
      .delete(`${BackendEndpoint.HANDLER_NOTES}${noteId}/`)
      .reply(500, 'server error');

    const { result } = renderHook(
      () => useDeleteNoteMutation(TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );

    await expect(result.current.mutateAsync(noteId)).rejects.toThrow();
    expect(mockErrorHandler).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });
});
