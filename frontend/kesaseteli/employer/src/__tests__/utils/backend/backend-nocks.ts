import faker from 'faker';
import BackendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import getBackendDomain from 'kesaseteli/employer/backend-api/get-backend-domain';
import Company from 'kesaseteli/employer/types/company';
import nock from 'nock';
import User from 'shared/types/user';

const authenticatedUser: User = {
  national_id_num: '111111-111C',
  given_name: faker.name.findName(),
  family_name: faker.name.findName(),
  name: faker.name.findName(),
};

const expectedCompany: Company = {
  id: 'id',
  name: 'Acme Oy',
  business_id: '0877830-0',
  industry: 'Taloustavaroiden vähittäiskauppa',
  street_address: 'Vasaratie 4 A 3',
  postcode: '65350',
  city: 'Vaasa',
};

export const expectAuthorizedReply = (persistValue = false): User => {
  nock(getBackendDomain())
    .persist(persistValue)
    .get(BackendEndpoint.USER)
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });
  return authenticatedUser;
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
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetCompanyReply = (): Company => {
  nock(getBackendDomain())
    .get(BackendEndpoint.COMPANY)
    .reply(200, expectedCompany, { 'Access-Control-Allow-Origin': '*' });
  return expectedCompany;
};

export const expectToGetCompanyErrorReply = (times = 1): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.COMPANY)
    .times(times)
    .replyWithError('This is a test error. Please ignore this error message.');
