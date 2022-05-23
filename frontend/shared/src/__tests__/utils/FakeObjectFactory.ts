import faker from 'faker';
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
import ContactInfo from '../../types/contact-info';
import type Employment from '../../types/employment';
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

type Options = {
  useUuid: boolean;
};

let idCounter = 1;

class FakeObjectFactory {
  private useUuid?: boolean;

  public readonly fakeCompany: Company = {
    id: 'id',
    name: 'Acme Oy',
    business_id: '0877830-0',
    industry: 'Taloustavaroiden vähittäiskauppa',
    street_address: 'Vasaratie 4 A 3',
    postcode: '65350',
    city: 'Vaasa',
    company_form: 'oy',
  };

  constructor(options?: Options) {
    const { useUuid } = { ...options };
    this.useUuid = useUuid;
  }

  private generateId(): string {
    // eslint-disable-next-line no-plusplus
    return this.useUuid ? faker.datatype.uuid() : String(idCounter++);
  }

  // eslint-disable-next-line class-methods-use-this
  public fakeUser(): User {
    return {
      given_name: faker.name.firstName(),
      family_name: faker.name.lastName(),
      name: faker.name.findName(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  public fakeContactInfo(): ContactInfo {
    return {
      contact_person_name: faker.name.findName(),
      contact_person_email: faker.internet.email(),
      contact_person_phone_number: faker.phone.phoneNumber(),
      street_address: faker.address.streetAddress(),
      bank_account_number: faker.finance.iban(),
    };
  }


  public fakeAttachment(type?: AttachmentType): KesaseteliAttachment {
    return {
      id: this.generateId(),
      application: this.generateId(),
      attachment_type: type ?? faker.random.arrayElement(ATTACHMENT_TYPES),
      attachment_file: faker.datatype.string(100),
      attachment_file_name: faker.random.arrayElement(attachmentFilePaths),
      content_type: faker.random.arrayElement(ATTACHMENT_CONTENT_TYPES),
      summer_voucher: this.generateId(),
    };
  }

  public fakeAttachments(
    type: AttachmentType,
    count = faker.datatype.number(4) + 1
  ): KesaseteliAttachment[] {
    return generateArray(() => this.fakeAttachment(type), count);
  }

  public fakeEmployment(): Required<Employment> {
    return {
      id: this.generateId(),
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
      employment_work_hours: faker.datatype.number({
        max: 100,
        precision: 0.1,
      }),
      employment_salary_paid: faker.datatype.number({
        max: 4000,
        precision: 0.01,
      }),
      employment_description: faker.lorem.paragraph(1),
      hired_without_voucher_assessment: faker.random.arrayElement([
        'yes',
        'no',
        'maybe',
      ]),
      summer_voucher_serial_number: faker.internet.password(10),
      attachments: [
        ...this.fakeAttachments('payslip'),
        ...this.fakeAttachments('employment_contract'),
      ],
      payslip: [],
      employment_contract: [],
    };
  }

  public fakeEmployments(
    count = faker.datatype.number({ min: 2, max: 10 })
  ): Required<Employment>[] {
    return generateArray(() => this.fakeEmployment(), count);
  }

  public fakeApplication(company?: Company, language?: Language): Application {
    return getFormApplication({
      id: this.generateId(),
      company: company ?? this.fakeCompany,
      status: 'draft',
      summer_vouchers: this.fakeEmployments(2),
      ...this.fakeContactInfo(),
      submitted_at: formatDate(new Date(), DATE_FORMATS.BACKEND_DATE),
      language: language ?? DEFAULT_LANGUAGE,
    });
  }

  public fakeApplications(count = faker.datatype.number(10)): Application[] {
    return generateArray(() => this.fakeApplication(), count);
  }
}

export default FakeObjectFactory;
