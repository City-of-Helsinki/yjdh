import faker from 'faker';

/* These are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import type Application from '../../types/application';
import type Company from '../../types/company';
import ContactPerson from '../../types/contact_person';
import type Employment from '../../types/employment';
import type Invoicer from '../../types/invoicer';
import type User from '../../types/user';
import { DATE_FORMATS, formatDate } from '../../utils/date.utils';

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

export const fakeContactPerson = (): ContactPerson => ({
  contact_person_name: faker.name.findName(),
  contact_person_email: faker.internet.email(),
  contact_person_phone_number: faker.phone.phoneNumber(),
  street_address: faker.address.streetAddress(),
});

export const fakeInvoicer = (): Required<Invoicer> => ({
  invoicer_name: faker.name.findName(),
  invoicer_email: faker.internet.email(),
  invoicer_phone_number: faker.phone.phoneNumber(),
});

export const fakeEmployment = (): Required<Employment> => ({
  id: faker.datatype.uuid(),
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
  employment_start_date: formatDate(
    faker.date.past(),
    DATE_FORMATS.BACKEND_DATE
  ),
  employment_end_date: formatDate(
    faker.date.future(),
    DATE_FORMATS.BACKEND_DATE
  ),
  employment_work_hours: faker.datatype.number({ max: 100, precision: 0.1 }),
  employment_salary_paid: faker.datatype.number({ max: 4000, precision: 0.01 }),
  employment_description: faker.lorem.paragraph(1),
  hired_without_voucher_assessment: faker.random.arrayElement([
    'yes',
    'no',
    'maybe',
  ]),
  summer_voucher_serial_number: faker.datatype.string(10),
});

export const fakeEmployments = (
  count = faker.datatype.number(10)
): Required<Employment>[] => generateNodeArray(() => fakeEmployment(), count);

export const fakeApplication = (
  id: string,
  invoicer?: boolean
): Application => ({
  id,
  company: fakeCompany,
  status: 'draft',
  summer_vouchers: fakeEmployments(1),
  ...fakeContactPerson(),
  is_separate_invoicer: invoicer || false,
  modified_at: formatDate(new Date(), DATE_FORMATS.BACKEND_DATE),
  ...(invoicer && fakeInvoicer()),
});

export const fakeApplications = (
  count = faker.datatype.number(10)
): Application[] =>
  generateNodeArray(() => fakeApplication(faker.datatype.uuid()), count);
