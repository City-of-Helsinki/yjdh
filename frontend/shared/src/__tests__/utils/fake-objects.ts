import faker from 'faker';
// eslint-disable-next-line unicorn/prefer-node-protocol
import fs from 'fs';
// eslint-disable-next-line unicorn/prefer-node-protocol
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
import Attachment, { AttachmentType } from '../../types/attachment';
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

const generateNodeArray = <T, F extends (...args: unknown[]) => T>(
  fakeFunc: F,
  count: number
): T[] => Array.from({ length: count }, (_, i) => fakeFunc(i));

export const fakeUser = (): User => ({
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

export const fakeAttachment = (type?: AttachmentType): Attachment =>
  ({
    id: faker.datatype.uuid(),
    application: faker.datatype.uuid(),
    attachment_type: type ?? faker.random.arrayElement(ATTACHMENT_TYPES),
    attachment_file: faker.datatype.string(100),
    attachment_file_name: faker.random.arrayElement(attachmentFilePaths),
    content_type: faker.random.arrayElement(ATTACHMENT_CONTENT_TYPES),
    summer_voucher: faker.datatype.uuid(),
  } as Attachment);

export const fakeAttachments = (
  type: AttachmentType,
  count = faker.datatype.number(4) + 1
): Attachment[] => generateNodeArray(() => fakeAttachment(type), count);

export const fakeEmployment = (): Required<Employment> => ({
  id: faker.datatype.uuid(),
  summer_voucher_exception_reason: faker.random.arrayElement(
    EMPLOYEE_EXCEPTION_REASON
  ),
  employee_name: faker.name.findName(),
  employee_school: faker.commerce.department(),
  employee_ssn: '111111-111C',
  employee_phone_number: faker.phone.phoneNumber(),
  employee_home_city: faker.address.cityName(),
  employee_postcode: faker.datatype.number(99999),
  employment_postcode: faker.datatype.number(99999),
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
  summer_voucher_serial_number: faker.datatype.string(10),
  attachments: [
    ...fakeAttachments('payslip'),
    ...fakeAttachments('employment_contract'),
  ],
  payslip: [],
  employment_contract: [],
});

export const fakeEmployments = (
  count = faker.datatype.number({ min: 2, max: 10 })
): Required<Employment>[] => generateNodeArray(() => fakeEmployment(), count);

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
  generateNodeArray(() => fakeApplication(faker.datatype.uuid()), count);
