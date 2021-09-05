import faker from 'faker';

/* These are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import type Company from '../../types/company';
import type Application from '../../types/employer-application';
import type Employment from '../../types/Employment';
import type Invoicer from '../../types/invoicer';
import type User from '../../types/user';

const generateNodeArray = <T, F extends (...args: unknown[]) => T>(
  fakeFunc: F,
  count: number
): T[] => Array.from({ length: count }, (_, i) => fakeFunc(i));

export const fakeUser = (): User => ({
  national_id_num: '111111-111C',
  given_name: faker.name.findName(),
  family_name: faker.name.findName(),
  name: faker.name.findName(),
});

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

export const fakeEmployment = (): Employment => ({
  id: faker.datatype.uuid(),
  unnumbered_summer_voucher_reason: 'test', // TODO: To be removed after backend hack
  summer_voucher_exception_reason: faker.random.arrayElement([
    '9th_grader',
    'born_2004',
  ]),
  employee_name: faker.name.findName(),
  employee_school: faker.commerce.department(),
  employee_ssn: '111111-111C',
  employee_phone_number: faker.phone.phoneNumber(),
  employee_home_city: faker.address.cityName(),
  employee_postcode: faker.datatype.number({
    min: 0,
    max: 9999,
    precision: 1000,
  }),
  employment_postcode: faker.datatype.number({
    min: 0,
    max: 9999,
    precision: 1000,
  }),
  employment_start_date: faker.date.past(),
  employment_end_date: faker.date.future(),
  employment_work_hours: faker.datatype.number(100),
  employment_salary_paid: faker.datatype.number(3000),
  employment_description: faker.lorem.paragraph(1),
  employee_hired_without_voucher_assessment: faker.random.arrayElement([
    'yes',
    'no',
    'maybe',
  ]),
});

export const fakeEmployments = (
  count = faker.random.number(10)
): Employment[] => generateNodeArray(() => fakeEmployment(), count);

export const fakeApplication = (id: string): Application => ({
  id,
  company: fakeCompany,
  status: 'draft',
  summer_vouchers: fakeEmployments(),
  ...fakeInvoicer(),
});

export const fakeApplications = (
  count = faker.random.number(10)
): Application[] =>
  generateNodeArray(() => fakeApplication(faker.datatype.uuid()), count);
