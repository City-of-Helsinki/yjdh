import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import { NoteTargetType, NoteType } from '../../../types/note';
import useUpdateNoteMutation from '../useUpdateNoteMutation';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// SonarCloud: Dummy URL used only as a base for mocking requests with nock in unit tests.
const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';
const TEST_NOTE_ID = 'note-id-123';
const TEST_TARGET_ID = 'abc-123';
const TEST_TARGET_TYPE = NoteTargetType.YOUTH_APPLICATION;

describe('useUpdateNoteMutation', () => {
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

  it('updates note successfully and invalidates queries', async () => {
    const payload = {
      content: 'updated note content',
      note_type: NoteType.INTERNAL,
      is_important: true,
    };
    const responseData = {
      id: TEST_NOTE_ID,
      ...payload,
      target_type: TEST_TARGET_TYPE,
      target_id: TEST_TARGET_ID,
    };

    nock(API_BASE_TEST_URL)
      .put(`${BackendEndpoint.HANDLER_NOTES}${TEST_NOTE_ID}/`, payload)
      .reply(200, responseData);

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () =>
        useUpdateNoteMutation(TEST_NOTE_ID, TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );

    await result.current.mutateAsync(payload);

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

  it('calls useErrorHandler on failure', async () => {
    const payload = {
      content: 'updated note content',
      note_type: NoteType.INTERNAL,
      is_important: true,
    };

    nock(API_BASE_TEST_URL)
      .put(`${BackendEndpoint.HANDLER_NOTES}${TEST_NOTE_ID}/`, payload)
      .reply(500, 'server error');

    const { result } = renderHook(
      () =>
        useUpdateNoteMutation(TEST_NOTE_ID, TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );

    await expect(result.current.mutateAsync(payload)).rejects.toThrow();
    expect(mockErrorHandler).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });
});
