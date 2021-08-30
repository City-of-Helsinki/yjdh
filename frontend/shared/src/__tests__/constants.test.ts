import faker from 'faker';

import {
  ADDRESS_REGEX,
  CITY_REGEX,
  COMPANY_BANK_ACCOUNT_NUMBER,
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
    });

    describe('ADDRESS_REGEX', () => {
      it('should match addresses', () => {
        const address = faker.address.streetAddress();

        expect(address).toMatch(ADDRESS_REGEX);
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
  });
});
