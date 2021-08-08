import { fakeUser } from 'kesaseteli/employer/__tests__/utils/fake-objects';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli/employer/backend-api/backend-api';
import Application from 'kesaseteli/employer/types/application';
import nock from 'nock';
import User from 'shared/types/user';

export const expectAuthorizedReply = (persistValue = false): User => {
  nock(getBackendDomain())
    .persist(persistValue)
    .get(BackendEndpoint.USER)
    .reply(200, fakeUser, { 'Access-Control-Allow-Origin': '*' });
  return fakeUser;
};
export const expectUnauthorizedReply = (persistValue = false): nock.Scope =>
  nock(getBackendDomain())
    .persist(persistValue)
    .get(BackendEndpoint.USER)
    .replyWithError('401 Unauthorized');

export const expectToLogin = (): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.LOGIN)
    .reply(200, 'OK', { 'Access-Control-Allow-Origin': '*' });

export const expectToLogout = (): nock.Scope =>
  nock(getBackendDomain())
    .post(BackendEndpoint.LOGOUT)
    .reply(200, fakeUser, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationFromBackend = (application: Application): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.APPLICATIONS}${application.id}/`)
    .reply(200, application, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationErrorFromBackend = (id: string): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.APPLICATIONS}${id}/`)
    .replyWithError('This is a test error. Please ignore this error message.');

export const expectToGetApplicationsFromBackend = (applications: Application[]): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.APPLICATIONS}`)
    .reply(200, applications, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationsErrorFromBackend = (): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.APPLICATIONS}`)
    .replyWithError('This is a test error. Please ignore this error message.');


export const expectToCreateApplicationToBackend = (applicationToCreate: Application): nock.Scope =>
  nock(getBackendDomain())
    .post(`${BackendEndpoint.APPLICATIONS}`, {})
    .reply(200, applicationToCreate, { 'Access-Control-Allow-Origin': '*' });

export const expectToCreateApplicationErrorFromBackend = (): nock.Scope =>
  nock(getBackendDomain())
    .post(`${BackendEndpoint.APPLICATIONS}`, {})
    .replyWithError('This is a test error. Please ignore this error message.');


export const expectToSaveApplication = (applicationToSave: Application): nock.Scope =>
  nock(getBackendDomain())
    .put(`${BackendEndpoint.APPLICATIONS}${applicationToSave.id}/`, {...applicationToSave, status: "draft"} as Application)
    .reply(200, applicationToSave, { 'Access-Control-Allow-Origin': '*' });
