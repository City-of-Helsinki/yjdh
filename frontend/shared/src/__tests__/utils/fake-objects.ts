import faker from 'faker';

/* these are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import type Company from '../../types/company';
import type Application from '../../types/employer-application';
import type Invoicer from '../../types/invoicer';
import type User from '../../types/user';

const generateNodeArray = <T, F extends (...args: unknown[]) => T>(
  fakeFunc: F,
  count: number
): T[] => Array.from({ length: count }, (_, i) => fakeFunc(i));

export const fakeUser: User = {
  national_id_num: '111111-111C',
  given_name: faker.name.findName(),
  family_name: faker.name.findName(),
  name: faker.name.findName(),
};

export const fakeCompany: Company = {
  id: 'id',
  name: 'Acme Oy',
  business_id: '0877830-0',
  industry: 'Taloustavaroiden vähittäiskauppa',
  street_address: 'Vasaratie 4 A 3',
  postcode: '65350',
  city: 'Vaasa',
  company_form: 'oy',
};

export const fakeInvoicer = (): Invoicer => ({
  invoicer_name: faker.name.findName(),
  invoicer_email: faker.internet.email(),
  invoicer_phone_number: faker.phone.phoneNumber(),
});

export const fakeApplication = (id: string): Application => ({
  id,
  company: fakeCompany,
  status: 'draft',
  summer_vouchers: [],
  ...fakeInvoicer(),
});

export const fakeApplications = (count: number): Application[] =>
  generateNodeArray(() => fakeApplication(faker.datatype.uuid()), count);
