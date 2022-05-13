import faker from 'faker';
import { fakeSchools } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import {
  BackendEndpoint,
  getAdditionalInfoQueryKey,
  getBackendDomain,
  getYouthApplicationStatusQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import AdditionalInfoApplication from 'kesaseteli-shared/types/additional-info-application';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import YouthApplication from 'kesaseteli-shared/types/youth-application';
import YouthApplicationStatus from 'kesaseteli-shared/types/youth-application-status';
import nock from 'nock';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { ErrorType } from 'kesaseteli-shared/types/youth-application-creation-error';

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
  (errorCode: 400 | 404 | 500, errorType?: ErrorType) =>
  (application: YouthApplication): nock.Scope => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    return nock(getBackendDomain())
      .post(BackendEndpoint.YOUTH_APPLICATIONS, application)
      .reply(
        errorCode,
        errorType
          ? () => ({ code: errorType })
          : 'This is a create youth application backend test error. Please ignore this error message.'
      );
  };
/**
 * Example reply from backend
 * {
 *     "first_name": [
 *         "Enter a valid value."
 *     ],
 *     "last_name": [
 *         "Enter a valid value."
 *     ],
 *     "social_security_number": [
 *         "ABCDE is not a valid Finnish social security number. Make sure to have it in uppercase and without whitespace."
 *     ],
 *     "school": [
 *         "Enter a valid value."
 *     ],
 *     "email": [
 *         "Enter a valid email address."
 *     ],
 *     "phone_number": [
 *         "Enter a valid value."
 *     ],
 *     "postcode": [
 *         "Enter a valid value."
 *     ]
 * }
 * @param backendErrorObject
 */
export const expectToReplyValidationErrorWhenCreatingYouthApplication =
  (backendErrorObject: Record<string, string[]>) =>
  (application: YouthApplication): nock.Scope => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    return nock(getBackendDomain())
      .post(BackendEndpoint.YOUTH_APPLICATIONS, application)
      .reply(400, () => backendErrorObject);
  };

export const expectToGetYouthApplicationStatus = (
  id: CreatedYouthApplication['id'],
  expectedStatus: YouthApplicationStatus
): nock.Scope =>
  nock(getBackendDomain())
    .get(getYouthApplicationStatusQueryKey(id))
    .reply(200, expectedStatus, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetYouthApplicationStatusErrorFromBackend = (
  id: CreatedYouthApplication['id'],
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(getYouthApplicationStatusQueryKey(id))
    .reply(
      errorCode,
      'This is a school list backend test error. Please ignore this error message.'
    );
};

export const expectToCreateAdditionalInfo = (
  applicationId: CreatedYouthApplication['id'],
  additionalInfo: AdditionalInfoApplication
): nock.Scope =>
  nock(getBackendDomain())
    .post(getAdditionalInfoQueryKey(applicationId), additionalInfo)
    .reply(
      200,
      { ...additionalInfo, id: faker.datatype.uuid() },
      { 'Access-Control-Allow-Origin': '*' }
    );

export const expectToReplyErrorWhenCreatingAdditionalInfo = (
  applicationId: CreatedYouthApplication['id'],
  additionalInfo: AdditionalInfoApplication,
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .post(getAdditionalInfoQueryKey(applicationId), additionalInfo)
    .reply(
      errorCode,
      'This is a create youth application backend test error. Please ignore this error message.'
    );
};
