import faker from 'faker';

import {
  ADDRESS_REGEX,
  CITY_REGEX,
  COMPANY_BANK_ACCOUNT_NUMBER,
  FINNISH_SSN_REGEX,
  NAMES_REGEX,
  PHONE_NUMBER_REGEX,
  POSTAL_CODE_REGEX,
} from '../constants';

describe('constants', () => {
  describe('regex', () => {
    describe('NAMES_REGEX', () => {
      it('should match Finnish first names, last names and full names', () => {
        const firstName = 'Helinä';
        const lastName = 'Aalto';
        const fullName = 'Kalle Väyrynen';
        const fullName2 = 'Janne Ö';

        expect(firstName).toMatch(NAMES_REGEX);
        expect(lastName).toMatch(NAMES_REGEX);
        expect(fullName).toMatch(NAMES_REGEX);
        expect(fullName2).toMatch(NAMES_REGEX);
      });

      it('should match Swedish first names, last names and full names', () => {
        const firstName = 'Gun-Britt';
        const lastName = 'Lindén';
        const fullName = 'Ögge Ekström';

        expect(firstName).toMatch(NAMES_REGEX);
        expect(lastName).toMatch(NAMES_REGEX);
        expect(fullName).toMatch(NAMES_REGEX);
      });

      it('should match English first names, last names and full names', () => {
        const firstName = 'Eric';
        const lastName = 'Bradtke';
        const fullName = "Daniela O'Brian";

        expect(firstName).toMatch(NAMES_REGEX);
        expect(lastName).toMatch(NAMES_REGEX);
        expect(fullName).toMatch(NAMES_REGEX);
      });

      it('should fail to match invalid characters', () => {
        const invalidCharacters = '!@#$%^&*()_+-=[]{}|;\':",./<>?';

        expect(invalidCharacters).not.toMatch(NAMES_REGEX);
      });

      it('should fail to match digits', () => {
        const digits = '1234567890';

        expect(digits).not.toMatch(NAMES_REGEX);
      });
    });

    describe('POSTAL_CODE_REGEX', () => {
      it('should match Finnish postal codes', () => {
        const postalCode = faker.address.zipCode('#####');

        expect(postalCode).toMatch(POSTAL_CODE_REGEX);
      });

      it('should fail to match non-Finnish postal codes', () => {
        const postalCode1 = faker.address.zipCode('####');
        const postalCode2 = faker.address.zipCode('######');

        expect(postalCode1).not.toMatch(POSTAL_CODE_REGEX);
        expect(postalCode2).not.toMatch(POSTAL_CODE_REGEX);
      });

      it('should fail to match invalid characters', () => {
        const invalidCharacters = '!@#$%^&*()_+-=[]{}|;\':",./<>?';

        expect(invalidCharacters).not.toMatch(POSTAL_CODE_REGEX);
      });
    });

    describe('CITY_REGEX', () => {
      it('should match cities names in Finnish and Swedish', () => {
        const citiesFI = [
          'Brändö',
          'Eckerö',
          'Eurajoki',
          'Evijärvi',
          'Finström',
          'Föglö',
          'Mänttä-Vilppula',
          'Pedersören kunta',
          'Siuntio',
          'Sodankylä',
          'Sonkajärvi',
          'Sotkamo',
          'Sottunga',
          'Sulkava',
          'Sysmä',
          'Säkylä',
          'Tornio',
          'Turku',
          'Ähtäri',
        ];

        const citiesSV = [
          'Brändö',
          'Eckerö',
          'Euraåminne',
          'Evijärvi',
          'Finström',
          'Föglö',
          'Mänttä-Vilppula',
          'Pedersöre',
          'Sjundeå',
          'Sodankylä',
          'Sonkajärvi',
          'Sotkamo',
          'Sottunga',
          'Sulkava',
          'Sysmä',
          'Säkylä',
          'Torneå',
          'Åbo',
          'Etseri',
        ];

        citiesFI.forEach((city) => {
          expect(city).toMatch(CITY_REGEX);
        });

        citiesSV.forEach((city) => {
          expect(city).toMatch(CITY_REGEX);
        });
      });

      it('should fail to match invalid characters', () => {
        const invalidCharacters = '!@#$%^&*()_+-=[]{}|;\':",./<>?';
        const invalidCityName = 'Helsinki1';

        expect(invalidCharacters).not.toMatch(CITY_REGEX);
        expect(invalidCityName).not.toMatch(CITY_REGEX);
      });
    });

    describe('ADDRESS_REGEX', () => {
      it('should match addresses', () => {
        const address1 = 'Rantatie 2, Helsinki';
        const address2 = 'Jäätie 23, Åbo';

        expect(address1).toMatch(ADDRESS_REGEX);
        expect(address2).toMatch(ADDRESS_REGEX);
      });

      it('should not match non-address strings', () => {
        const nonAddress = '#@';

        expect(nonAddress).not.toMatch(ADDRESS_REGEX);
      });
    });

    describe('PHONE_NUMBER_REGEX', () => {
      it('should match Finnish phone numbers', () => {
        const phoneNumbers = [
          '040 084 1684',
          '050 135 6339',
          '0505-551-9417',
          '04575553503',
          '+358-505-551-4995',
          '+3585005551193',
        ];

        phoneNumbers.forEach((phoneNumber) => {
          expect(phoneNumber).toMatch(PHONE_NUMBER_REGEX);
        });
      });

      it('should not match non-Finish phone numbers', () => {
        const phoneNumbers = ['+1-800-555-1212', '+44-20-7011-5555'];

        phoneNumbers.forEach((phoneNumber) => {
          expect(phoneNumber).not.toMatch(PHONE_NUMBER_REGEX);
        });
      });
    });

    describe('COMPANY_BANK_ACCOUNT_NUMBER', () => {
      it('should match Finnish bank account numbers', () => {
        const accountNumber = faker.finance.account(16);

        expect(`FI${accountNumber}`).toMatch(COMPANY_BANK_ACCOUNT_NUMBER);
      });

      it('should not match non-Finnish bank account numbers', () => {
        const accountNumber = faker.finance.account(8);

        expect(accountNumber).not.toMatch(COMPANY_BANK_ACCOUNT_NUMBER);
      });
    });

    describe('FINNISH_SSN_REGEX', () => {
      it('should match Finnish non-temporary social security numbers', () => {
        const socialSecurityNumbers = [
          '010100+002H',
          '010203-1230',
          '111111-002V',
          '111111-111C',
          '111111A111C',
          '111111U111C',
          '111111V111C',
          '111111W111C',
          '111111X111C',
          '111111Y111C',
          '121212A899H',
          '121212B899H',
          '121212C899H',
          '121212D899H',
          '121212E899H',
          '121212F899H',
          '300522A0024',
          '300522B0024',
          // All possible checksum characters & before first & beyond last
          '111111B098Y',
          '111111B0990',
          '111111B1001',
          '111111B1012',
          '111111B1023',
          '111111B1034',
          '111111B1045',
          '111111B1056',
          '111111B1067',
          '111111B1078',
          '111111B1089',
          '111111B109A',
          '111111B110B',
          '111111B111C',
          '111111B112D',
          '111111B113E',
          '111111B114F',
          '111111B115H',
          '111111B116J',
          '111111B117K',
          '111111B118L',
          '111111B119M',
          '111111B120N',
          '111111B121P',
          '111111B122R',
          '111111B123S',
          '111111B124T',
          '111111B125U',
          '111111B126V',
          '111111B127W',
          '111111B128X',
          '111111B129Y',
          '111111B1300',
        ];

        socialSecurityNumbers.forEach((socialSecurityNumber) => {
          expect(socialSecurityNumber).toMatch(FINNISH_SSN_REGEX);
        });
      });

      it('should not match Finnish temporary or invalid social security numbers', () => {
        const socialSecurityNumbers = [
          '111111-900U', // Otherwise valid but 900–999 individual number is rejected
          '111111-9991', // Otherwise valid but 900–999 individual number is rejected
          '111111-900U', // Otherwise valid but 900–999 individual number is rejected
          '111111-9991', // Otherwise valid but 900–999 individual number is rejected
          '311299A999E', // Otherwise valid but 900–999 individual number is rejected
          '311299F999E', // Otherwise valid but 900–999 individual number is rejected
          '30052 2A0025', //  Inner whitespace
          '111111 -111x', //  Invalid checksum, inner whitespace
          '111111/111C', //  Invalid century character
          '111111G111C', //  Invalid century character
          '111111M111C', //  Invalid century character
          '111111R111C', //  Invalid century character
          '111111T111C', //  Invalid century character
          '111111Z111C', //  Invalid century character
          '111111B111G', // Invalid checksum character
          '111111B111I', // Invalid checksum character
          '111111B111O', // Invalid checksum character
          '111111B111Q', // Invalid checksum character
          '111111B111Z', // Invalid checksum character
          '111111B111', // Missing checksum
        ];

        socialSecurityNumbers.forEach((socialSecurityNumber) => {
          expect(socialSecurityNumber).not.toMatch(FINNISH_SSN_REGEX);
        });
      });
    });
  });
});
