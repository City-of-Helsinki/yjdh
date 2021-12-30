import faker from 'faker';
import { fakeSchools } from 'kesaseteli/youth/__tests__/utils/fake-objects';
import YouthApplication from 'kesaseteli/youth/types/youth-application';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';

// disable unnecessary axios' expected error messages
// https://stackoverflow.com/questions/44467657/jest-better-way-to-disable-console-inside-unit-tests
let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  // eslint-disable-next-line chai-friendly/no-unused-expressions
  consoleSpy?.mockRestore();
});

afterEach(async () => {
  // avoid situation where some request is still pending but test is completed
  await waitForBackendRequestsToComplete();
  // Check that all nocks are used: https://michaelheap.com/nock-all-mocks-used/
  if (!nock.isDone()) {
    throw new Error(
      `Not all nock interceptors were used: ${JSON.stringify(
        nock.pendingMocks()
      )}`
    );
  }
  nock.cleanAll();
});
nock.disableNetConnect();

export const expectToGetSchoolsFromBackend = (): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.SCHOOLS)
    .reply(200, fakeSchools, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetSchoolsErrorFromBackend = (
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(BackendEndpoint.SCHOOLS)
    .reply(
      errorCode,
      'This is a school list backend test error. Please ignore this error message.'
    );
};

export const expectToCreateYouthApplication = (
  application: YouthApplication
): nock.Scope =>
  nock(getBackendDomain())
    .post(BackendEndpoint.YOUTH_APPLICATIONS, application)
    .reply(
      200,
      { ...application, id: faker.datatype.uuid() },
      { 'Access-Control-Allow-Origin': '*' }
    );

export const expectToReplyErrorWhenCreatingYouthApplication =
  (errorCode: 400 | 404 | 500) =>
  (application: YouthApplication): nock.Scope => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    return nock(getBackendDomain())
      .post(BackendEndpoint.YOUTH_APPLICATIONS, application)
      .reply(
        errorCode,
        'This is a create youth application backend test error. Please ignore this error message.'
      );
  };
