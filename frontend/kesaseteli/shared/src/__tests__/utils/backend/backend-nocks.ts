import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli-shared/backend-api/backend-api';
import nock from 'nock';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import type Application from 'shared/types/application';
import type DraftApplication from 'shared/types/draft-application';

const fakeObjectFactory = new FakeObjectFactory();

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

export const expectAuthorizedReply = (
  expectedUser = fakeObjectFactory.fakeUser()
): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.USER)
    .reply(200, expectedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectUnauthorizedReply = (): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(BackendEndpoint.USER)
    .replyWithError('401 Unauthorized');
};
export const expectToLogin = (): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.LOGIN)
    .reply(200, 'OK', { 'Access-Control-Allow-Origin': '*' });

export const expectToLogout = (
  expectedUser = fakeObjectFactory.fakeUser()
): nock.Scope =>
  nock(getBackendDomain())
    .post(BackendEndpoint.LOGOUT)
    .reply(200, expectedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationFromBackend = (
  application: Application
): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${application.id}/`)
    .reply(200, application, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationErrorFromBackend = (
  id: string
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id}/`)
    .replyWithError(
      '500: This is a load application test server error. Please ignore this error message.'
    );
};
export const expectToGetApplicationsFromBackend = (
  applications: Application[]
): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.EMPLOYER_APPLICATIONS}`)
    .reply(200, applications, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationsErrorFromBackend = (
  times = 1
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .get(`${BackendEndpoint.EMPLOYER_APPLICATIONS}`)
    .times(times)
    .replyWithError(
      '500: This is a load applications test error. Please ignore this error message.'
    );
};
export const expectToCreateApplicationToBackend = (
  applicationToCreate: Application
): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .post(`${BackendEndpoint.EMPLOYER_APPLICATIONS}`, {
      language: applicationToCreate.language,
    })
    .reply(200, applicationToCreate, { 'Access-Control-Allow-Origin': '*' });
};
export const expectToCreateApplicationErrorFromBackend = (): nock.Scope => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  return nock(getBackendDomain())
    .post(`${BackendEndpoint.EMPLOYER_APPLICATIONS}`, {
      language: DEFAULT_LANGUAGE,
    })
    .replyWithError(
      '500: This is a create application test error. Please ignore this error message.'
    );
};
export const expectToSaveApplication = (
  applicationToSave: Application
): nock.Scope =>
  nock(getBackendDomain())
    .put(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${applicationToSave.id}/`, {
      ...applicationToSave,
      status: 'draft',
    } as DraftApplication)
    .reply(200, applicationToSave, { 'Access-Control-Allow-Origin': '*' });
