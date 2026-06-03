// Integration test: Verifies request payloads are mapped correctly and endpoints are called using nock
import { renderHook } from '@testing-library/react-hooks';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import createAxiosTestContext from 'shared/__tests__/utils/create-axios-test-context';
import createReactQueryTestClient from 'shared/__tests__/utils/react-query/create-react-query-test-client';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';

import useCreateYouthApplicationWithoutSsnQuery from '../useCreateYouthApplicationWithoutSsnQuery';

const API_BASE_TEST_URL = 'http://kesaseteli-api';

describe('useCreateYouthApplicationWithoutSsnQuery (Integration)', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  const axios = createAxiosTestContext(API_BASE_TEST_URL);
  const queryClient = createReactQueryTestClient(axios, API_BASE_TEST_URL);

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL={API_BASE_TEST_URL}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BackendAPIProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it('correctly maps and posts application without ssn data', async () => {
    const mockCreatedResponse = {
      id: 'test-uuid-123',
      status: 'submitted',
    };

    const formData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      school: 'Test School',
      phoneNumber: '+358401234567',
      postcode: '00100',
      language: 'fi' as const,
      nonVtjBirthdate: '2008-05-15',
      nonVtjHomeMunicipality: 'Helsinki',
      additionalInfoDescription: 'Some test info',
      targetGroup: 'test-target-group-id',
    };

    nock(API_BASE_TEST_URL)
      .post(BackendEndpoint.CREATE_YOUTH_APPLICATION_WITHOUT_SSN, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        school: formData.school,
        phone_number: formData.phoneNumber,
        postcode: formData.postcode,
        language: formData.language,
        non_vtj_birthdate: formData.nonVtjBirthdate,
        non_vtj_home_municipality: formData.nonVtjHomeMunicipality,
        additional_info_description: formData.additionalInfoDescription,
        target_group: formData.targetGroup,
      })
      .reply(200, mockCreatedResponse);

    const { result, waitFor } = renderHook(
      () => useCreateYouthApplicationWithoutSsnQuery(),
      { wrapper }
    );

    result.current.mutate(formData);

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data).toEqual(mockCreatedResponse);
    expect(nock.isDone()).toBe(true);
  });
});
