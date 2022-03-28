import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
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

export const expectToGetYouthApplication = (
  expectedApplication: CreatedYouthApplication | ActivatedYouthApplication
): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.YOUTH_APPLICATIONS}${expectedApplication.id}/`)
    .reply(200, expectedApplication, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetYouthApplicationError = (
  id: CreatedYouthApplication['id'],
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/`)
    .reply(
      errorCode,
      'This is a youthapplications backend test error. Please ignore this error message.'
    );
};

export const expectToPatchYouthApplication = (
  operation: 'accept' | 'reject',
  id: ActivatedYouthApplication['id']
): nock.Scope =>
  nock(getBackendDomain())
    .patch(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/${operation}/`)
    .reply(
      200,
      { status: operation === 'accept' ? 'accepted' : 'rejected' },
      { 'Access-Control-Allow-Origin': '*' }
    );

export const expectToPatchYouthApplicationError = (
  operation: 'accept' | 'reject',
  id: ActivatedYouthApplication['id'],
  errorCode: 400 | 404 | 500
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .patch(`${BackendEndpoint.YOUTH_APPLICATIONS}${id}/${operation}/`)
    .reply(
      errorCode,
      `This is a youthapplications ${operation} backend test error. Please ignore this error message.`
    );
};
