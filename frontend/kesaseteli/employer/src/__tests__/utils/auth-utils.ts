import faker from 'faker';
import endpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import getBackendUrl from 'kesaseteli/employer/backend-api/backend-url';
import nock from 'nock';
import User from 'shared/types/user';

export const authenticatedUser: User = {
  national_id_num: '111111-111C',
  given_name: faker.name.findName(),
  family_name: faker.name.findName(),
  name: faker.name.findName(),
};

export const expectAuthorized = (persistValue = false): nock.Scope =>
  nock(getBackendUrl())
    .persist(persistValue)
    .get(endpoint.USER)
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectUnauthorized = (): nock.Scope =>
  nock(getBackendUrl()).get(endpoint.USER).replyWithError('401 Unauthorized');

export const expectToLogout = (): nock.Scope =>
  nock(getBackendUrl())
    .post(endpoint.LOGOUT)
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });
