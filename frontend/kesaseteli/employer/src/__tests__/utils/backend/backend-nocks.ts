import faker from 'faker';
import BackendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import getBackendDomain from 'kesaseteli/employer/backend-api/get-backend-domain';
import Company from 'kesaseteli/employer/types/company';
import nock from 'nock';
import User from 'shared/types/user';
import Application from 'kesaseteli/employer/types/application';

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

const expectedApplication = (id:string) : Application => ({
  id,
  company: expectedCompany,
  invoicer_email: faker.internet.email(),
  invoicer_name: faker.name.findName(),
  invoicer_phone_number: faker.phone.phoneNumber(),
  status: '',
  summer_vouchers: [],
});

export const expectAuthorizedReply = (persistValue = false): User => {
  nock(getBackendDomain())
    .persist(persistValue)
    .get(BackendEndpoint.user)
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });
  return authenticatedUser;
};
export const expectUnauthorizedReply = (persistValue = false): nock.Scope =>
  nock(getBackendDomain())
    .persist(persistValue)
    .get(BackendEndpoint.user)
    .replyWithError('401 Unauthorized');

export const expectToLogin = (): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.login)
    .reply(200, 'OK', { 'Access-Control-Allow-Origin': '*' });

export const expectToLogout = (): nock.Scope =>
  nock(getBackendDomain())
    .post(BackendEndpoint.logout)
    .reply(200, authenticatedUser, { 'Access-Control-Allow-Origin': '*' });

export const expectToGetApplicationReply = (id: string): Application => {
  const application = expectedApplication(id);
  nock(getBackendDomain())
    .get(BackendEndpoint.application(id))
    .reply(200, application, { 'Access-Control-Allow-Origin': '*' });
  return application;
};

export const expectToGetApplicationErrorReply = (id: string): nock.Scope =>
  nock(getBackendDomain())
    .get(BackendEndpoint.application(id))
    .replyWithError('This is a test error. Please ignore this error message.');
