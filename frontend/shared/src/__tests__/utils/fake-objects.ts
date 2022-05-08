import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';
import fs from 'fs';
import path from 'path';

/* These are relatively resolved paths because fake-objects is used from
 *  browser-tests which do not support tsconfig
 *  https://github.com/DevExpress/testcafe/issues/4144
 */
import {
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_TYPES,
} from '../../constants/attachment-constants';
import { EMPLOYEE_EXCEPTION_REASON } from '../../constants/employee-constants';
import { DEFAULT_LANGUAGE, Language } from '../../i18n/i18n';
import type Application from '../../types/application';
import { AttachmentType, KesaseteliAttachment } from '../../types/attachment';
import type Company from '../../types/company';
import ContactPerson from '../../types/contact_person';
import type Employment from '../../types/employment';
import type Invoicer from '../../types/invoicer';
import type User from '../../types/user';
import { getFormApplication } from '../../utils/application.utils';
import {
  convertToBackendDateFormat,
  DATE_FORMATS,
  formatDate,
} from '../../utils/date.utils';

// eslint-disable-next-line unicorn/prefer-module
const attachmentPath = path.join(__dirname, '../../../browser-tests/fixtures/');
// eslint-disable-next-line security/detect-non-literal-fs-filename
const attachmentFilePaths = fs
  .readdirSync(attachmentPath)
  .map((fileName) => attachmentPath + fileName);

export const generateArray = <T, F extends (...args: unknown[]) => T>(
  generator: F,
  count: number
): T[] => Array.from({ length: count }, (_, i) => generator(i));

// https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
export const getRandomSubArray = <T>(
  array: readonly T[],
  minLength?: number,
  maxLength?: number
): T[] => {
  const size = faker.datatype.number({
    min: minLength ?? 1,
    max: maxLength ?? array.length,
  });
  return [...array].sort(() => 0.5 - Math.random()).slice(0, size);
};

export const fakeUser = (): User => ({
  given_name: faker.name.firstName(),
  family_name: faker.name.lastName(),
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

export const fakeAttachment = (
  type?: AttachmentType
): KesaseteliAttachment => ({
  id: faker.datatype.uuid(),
  application: faker.datatype.uuid(),
  attachment_type: type ?? faker.random.arrayElement(ATTACHMENT_TYPES),
  attachment_file: faker.datatype.string(100),
  attachment_file_name: faker.random.arrayElement(attachmentFilePaths),
  content_type: faker.random.arrayElement(ATTACHMENT_CONTENT_TYPES),
  summer_voucher: faker.datatype.uuid(),
});

export const fakeAttachments = (
  type: AttachmentType,
  count = faker.datatype.number(4) + 1
): KesaseteliAttachment[] => generateArray(() => fakeAttachment(type), count);

export const fakeEmployment = (): Required<Employment> => ({
  id: faker.datatype.uuid(),
  summer_voucher_exception_reason: faker.random.arrayElement(
    EMPLOYEE_EXCEPTION_REASON
  ),
  employee_name: faker.name.findName(),
  employee_school: faker.commerce.department(),
  employee_ssn: '111111-111C',
  employee_phone_number: faker.phone.phoneNumber(),
  // for example dots are not allowed in city name, so let's remove them (St. Louis -> St Louis)
  employee_home_city: faker.address
    .cityName()
    .replace(/[^ A-Za-zÄÅÖäåö-]/g, ''),
  employee_postcode: faker.datatype.number(99_999),
  employment_postcode: faker.datatype.number(99_999),
  employment_start_date: convertToBackendDateFormat(faker.date.past()),
  employment_end_date: convertToBackendDateFormat(faker.date.future()),
  employment_work_hours: faker.datatype.number({ max: 100, precision: 0.1 }),
  employment_salary_paid: faker.datatype.number({ max: 4000, precision: 0.01 }),
  employment_description: faker.lorem.paragraph(1),
  hired_without_voucher_assessment: faker.random.arrayElement([
    'yes',
    'no',
    'maybe',
  ]),
  summer_voucher_serial_number: faker.internet.password(10),
  attachments: [
    ...fakeAttachments('payslip'),
    ...fakeAttachments('employment_contract'),
  ],
  payslip: [],
  employment_contract: [],
});

export const fakeEmployments = (
  count = faker.datatype.number({ min: 2, max: 10 })
): Required<Employment>[] => generateArray(() => fakeEmployment(), count);

export const fakeApplication = (
  id: string,
  company?: Company,
  invoicer?: boolean,
  language?: Language
): Application =>
  getFormApplication({
    id,
    company: company ?? fakeCompany,
    status: 'draft',

    summer_vouchers: fakeEmployments(2),
    ...fakeContactPerson(),
    is_separate_invoicer: invoicer || false,
    submitted_at: formatDate(new Date(), DATE_FORMATS.BACKEND_DATE),
    ...(invoicer && fakeInvoicer()),
    language: language ?? DEFAULT_LANGUAGE,
  });

export const fakeApplications = (
  count = faker.datatype.number(10)
): Application[] =>
  generateArray(() => fakeApplication(faker.datatype.uuid()), count);

/**
 * A bit complicated algorithm that tries to find ssn with certain year of birth using `FinnishSSN.createWithAge` function.
 * We use FinnishSSN library because it's easier and less error-prone than build a custom ssn function.
 * The problem with the function is that if today is 01.06.22 and
 * - we use value `FinnishSSN.createWithAge(16)` then valid birthdays would be 2.6.2005-31.5.2006
 * - we use value `FinnishSSN.createWithAge(15)` then valid birthdays would be 1.6.2006-31.5.2007
 * The idea is to generate ssns with `FinnishSSN.createWithAge` function for 15-16 year old
 * multiple times until we find first SSN with birth year of 2006
 */
export const fakeSSN = (yearOfBirth: number): string => {
  const yearOfBirthAge = new Date().getFullYear() - yearOfBirth;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 100; i++) {
    const ssn = FinnishSSN.createWithAge(
      faker.datatype.number({ min: yearOfBirthAge - 1, max: yearOfBirthAge })
    );
    const { dateOfBirth } = FinnishSSN.parse(ssn);
    if (dateOfBirth.getFullYear() === yearOfBirth) {
      return ssn;
    }
  }
  throw new Error("Something went wrong, couldn't find any suitable ssn!");
};
