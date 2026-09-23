import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { toast } from 'react-toastify';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';

import { APPLICATION_LIST_TYPES } from '../../../types/application';
import useAssignApplicationMutation from '../useAssignApplicationMutation';

const API_BASE_TEST_URL = 'https://kesaseteli-api-unit-test.invalid';

describe('useAssignApplicationMutation', () => {
  const axios = createAxiosTestContext(API_BASE_TEST_URL);
  const queryClient = createReactQueryTestClient(axios, API_BASE_TEST_URL);

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
    jest.clearAllMocks();
  });

  it.each([
    {
      description: 'youth application and sends modified_at in request body',
      applicationType: APPLICATION_LIST_TYPES.YOUTH,
      endpoint: BackendEndpoint.YOUTH_APPLICATIONS,
      applicationId: 'youth-app-1',
      modifiedAt: '2026-09-22T10:00:00Z',
      expectedBody: { modified_at: '2026-09-22T10:00:00Z' },
      status: 'application_handling',
    },
    {
      description: 'employer application without modified_at',
      applicationType: APPLICATION_LIST_TYPES.EMPLOYER,
      endpoint: BackendEndpoint.EMPLOYER_APPLICATIONS,
      applicationId: 'employer-app-2',
      modifiedAt: undefined,
      expectedBody: {},
      status: 'handling',
    },
  ])(
    'assigns $description',
    async ({
      applicationType,
      endpoint,
      applicationId,
      modifiedAt,
      expectedBody,
      status,
    }) => {
      const responseData = { id: applicationId, status };

      nock(API_BASE_TEST_URL)
        .post(`${endpoint}${applicationId}/assign/`, expectedBody)
        .reply(200, responseData);

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(
        () => useAssignApplicationMutation(applicationType),
        { wrapper }
      );

      await result.current.mutateAsync({
        id: applicationId,
        ...(modifiedAt ? { modified_at: modifiedAt } : {}),
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [endpoint],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [`${endpoint}${applicationId}/`],
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: [`${endpoint}${applicationId}/timeline/`],
      });
    }
  );

  it('invalidates queries and displays conflict toast on 409 conflict', async () => {
    const toastErrorSpy = jest.spyOn(toast, 'error');
    const applicationId = 'youth-app-conflict';
    const endpoint = BackendEndpoint.YOUTH_APPLICATIONS;

    nock(API_BASE_TEST_URL)
      .post(`${endpoint}${applicationId}/assign/`, {})
      .reply(409, { detail: 'Conflict' });

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAssignApplicationMutation(APPLICATION_LIST_TYPES.YOUTH),
      { wrapper }
    );

    await expect(
      result.current.mutateAsync({ id: applicationId })
    ).rejects.toThrow();

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [endpoint],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [`${endpoint}${applicationId}/`],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [`${endpoint}${applicationId}/timeline/`],
    });
    expect(toastErrorSpy).toHaveBeenCalledWith(
      'Toinen käsittelijä on jo ottanut tämän hakemuksen käsittelyyn.'
    );
  });

  it('invalidates queries and displays generic error toast on generic failure', async () => {
    const toastErrorSpy = jest.spyOn(toast, 'error');
    const applicationId = 'employer-app-fail';
    const endpoint = BackendEndpoint.EMPLOYER_APPLICATIONS;

    nock(API_BASE_TEST_URL)
      .post(`${endpoint}${applicationId}/assign/`, {})
      .reply(500, { detail: 'Server error' });

    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useAssignApplicationMutation(APPLICATION_LIST_TYPES.EMPLOYER),
      { wrapper }
    );

    await expect(
      result.current.mutateAsync({ id: applicationId })
    ).rejects.toThrow();

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [endpoint],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [`${endpoint}${applicationId}/`],
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: [`${endpoint}${applicationId}/timeline/`],
    });
    expect(toastErrorSpy).toHaveBeenCalledTimes(1);
    expect(toastErrorSpy).not.toHaveBeenCalledWith(
      'Toinen käsittelijä on jo ottanut tämän hakemuksen käsittelyyn.'
    );
  });
});
