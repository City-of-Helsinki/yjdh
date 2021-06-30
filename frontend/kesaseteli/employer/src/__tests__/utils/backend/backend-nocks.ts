import faker from 'faker';
import {
  BackendEndpoint,
  getBackendDomain,
} from 'kesaseteli/employer/backend-api/backend-api';
import Application from 'kesaseteli/employer/types/application';
import nock from 'nock';
import Company from 'shared/types/company';
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
  company_form: 'oy',
};

const expectedApplication = (id: string): Application => ({
  id,
  company: expectedCompany,
  invoicer_email: faker.internet.email(),
  invoicer_name: faker.name.findName(),
  invoicer_phone_number: faker.phone.phoneNumber(),
  status: 'draft',
  summer_vouchers: [],
});

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

export const expectToGetApplicationReply = (id: string): Application => {
  const application = expectedApplication(id);
  nock(getBackendDomain())
    .get(`${BackendEndpoint.APPLICATIONS}${id}/`)
    .reply(200, application, { 'Access-Control-Allow-Origin': '*' });
  return application;
};

export const expectToGetApplicationErrorReply = (id: string): nock.Scope =>
  nock(getBackendDomain())
    .get(`${BackendEndpoint.APPLICATIONS}${id}/`)
    .replyWithError('This is a test error. Please ignore this error message.');
