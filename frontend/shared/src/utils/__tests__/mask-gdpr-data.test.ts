import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';
import {
  fakeApplication,
  fakeCompany,
} from 'shared/__tests__/utils/fake-objects';
import maskGDPRData from 'shared/utils/mask-gdpr-data';

const masked = (str?: string): string => '*'.repeat(str?.length ?? 0);

describe('frontend/shared/src/utils/masked-gdpr-data.ts', () => {
  it('masks youth application', () => {
    const youthApplication = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      social_security_number: FinnishSSN.createWithAge(
        faker.datatype.number({ min: 16, max: 17 })
      ),
      postcode: faker.datatype.number({ min: 10_000, max: 99_999 }).toString(),
      unlistedSchool: faker.commerce.department(),
      is_unlisted_school: true,
      phone_number: faker.phone.phoneNumber('+358#########'),
      email: faker.internet.email(),
      termsAndConditions: true,
    };

    expect(maskGDPRData(youthApplication)).toEqual({
      ...youthApplication,
      last_name: masked(youthApplication.last_name),
      social_security_number: masked(youthApplication.social_security_number),
      phone_number: masked(youthApplication.phone_number),
      email: masked(youthApplication.email),
    });
  });

  it('employer application', () => {
    const application = fakeApplication('1234', fakeCompany, true);
    expect(maskGDPRData(application)).toEqual({
      ...application,
      company: {
        ...application.company,
        street_address: masked(application.company.street_address),
      },
      contact_person_name: masked(application.contact_person_name),
      contact_person_email: masked(application.contact_person_email),
      contact_person_phone_number: masked(
        application.contact_person_phone_number
      ),
      street_address: masked(application.street_address),
      invoicer_name: masked(application.invoicer_name),
      invoicer_email: masked(application.invoicer_email),
      invoicer_phone_number: masked(application.invoicer_phone_number),
      summer_vouchers: application.summer_vouchers.map((voucher) => ({
        ...voucher,
        employee_name: masked(voucher.employee_name),
        employee_ssn: masked(voucher.employee_ssn),
        employee_phone_number: masked(voucher.employee_phone_number),
      })),
    });
  });

  it('finds finnish ssn from string', () => {
    const ssn = FinnishSSN.createWithAge(
      faker.datatype.number({ min: 1, max: 120 })
    );
    const text1 = faker.lorem.text();
    const text2 = faker.lorem.text();
    expect(maskGDPRData(text1 + ssn + text2)).toEqual(
      text1 + masked(ssn) + text2
    );
  });

  it('finds finnish ssn from object', () => {
    const ssn1 = FinnishSSN.createWithAge(
      faker.datatype.number({ min: 1, max: 120 })
    );
    const ssn2 = FinnishSSN.createWithAge(
      faker.datatype.number({ min: 1, max: 120 })
    );
    const text1 = faker.lorem.text();
    const text2 = faker.lorem.text();
    const obj = {
      foo: {
        bar: text1 + ssn1 + text2,
      },
      baz: `${ssn1}0${ssn2}`,
    };
    expect(maskGDPRData(obj)).toEqual({
      foo: {
        bar: text1 + masked(ssn1) + text2,
      },
      baz: `${masked(ssn1)}0${masked(ssn2)}`,
    });
  });
});
