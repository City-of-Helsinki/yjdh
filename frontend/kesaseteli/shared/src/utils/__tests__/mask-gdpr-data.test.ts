import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';
import maskGDPRData from 'shared/utils/mask-gdpr-data';

import FakeObjectFactory from '../../__tests__/utils/FakeObjectFactory';

// Let's not uuid's because there is a fair chance that randomly generated uuid contains valid finnish ssn and thus
// is partially masked causing tests to fail
const fakeObjectFactory = new FakeObjectFactory({ useUuid: false });

const masked = (str?: string): string => '*'.repeat(str?.length ?? 0);

describe('frontend/kesaseteli/shared/src/utils/mask-gdpr-data.ts', () => {
  it('masks youth application', () => {
    const youthApplication = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      social_security_number: FinnishSSN.createWithAge(
        faker.datatype.number({ min: 16, max: 17 })
      ),
      postcode: faker.address.zipCode('#####'),
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
    const application = fakeObjectFactory.fakeApplication(
      fakeObjectFactory.fakeCompany
    );
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
      bank_account_number: masked(application.bank_account_number),
      summer_vouchers: application.summer_vouchers.map((voucher) => ({
        ...voucher,
        employee_name: masked(voucher.employee_name),
        employee_phone_number: masked(voucher.employee_phone_number),
      })),
    });
  });
});
