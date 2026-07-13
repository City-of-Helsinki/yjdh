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
import useCreateNoteMutation from '../useCreateNoteMutation';

jest.mock('shared/hooks/useErrorHandler', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';
const TEST_TARGET_ID = 'abc-123';
const TEST_TARGET_TYPE = NoteTargetType.YOUTH_APPLICATION;

describe('useCreateNoteMutation', () => {
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

  it('creates note successfully and invalidates queries', async () => {
    const payload = {
      target_type: TEST_TARGET_TYPE,
      target_id: TEST_TARGET_ID,
      content: 'test note',
      note_type: NoteType.INTERNAL,
      is_important: false,
    };
    const responseData = { id: 'note-1', ...payload };

    nock(API_BASE_TEST_URL)
      .post(BackendEndpoint.HANDLER_NOTES, payload)
      .reply(201, responseData);

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useCreateNoteMutation(TEST_TARGET_TYPE, TEST_TARGET_ID),
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
      target_type: TEST_TARGET_TYPE,
      target_id: TEST_TARGET_ID,
      content: 'test note',
      note_type: NoteType.INTERNAL,
      is_important: false,
    };

    nock(API_BASE_TEST_URL)
      .post(BackendEndpoint.HANDLER_NOTES, payload)
      .reply(500, 'server error');

    const { result } = renderHook(
      () => useCreateNoteMutation(TEST_TARGET_TYPE, TEST_TARGET_ID),
      { wrapper }
    );

    await expect(result.current.mutateAsync(payload)).rejects.toThrow();
    expect(mockErrorHandler).toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });
});
