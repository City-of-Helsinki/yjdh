import faker from 'faker';
import { FinnishSSN } from 'finnish-ssn';
import maskGDPRData from 'shared/utils/mask-gdpr-data';

const MASKED_SSN = '***********' as const;

describe('frontend/shared/src/utils/mask-gdpr-data.ts', () => {
  it('finds finnish ssn from string', () => {
    const ssn = FinnishSSN.createWithAge(
      faker.datatype.number({ min: 1, max: 120 })
    );
    const text1 = faker.lorem.text();
    const text2 = faker.lorem.text();
    const expectedResult = text1 + MASKED_SSN + text2;
    expect(maskGDPRData(text1 + ssn + text2)).toEqual(expectedResult);
    expect(maskGDPRData(text1 + ssn.toLowerCase() + text2)).toEqual(
      expectedResult
    );
    expect(maskGDPRData(text1 + ssn.toUpperCase() + text2)).toEqual(
      expectedResult
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
    const expectedResult = {
      foo: { bar: text1 + MASKED_SSN + text2 },
      baz: `${MASKED_SSN}0${MASKED_SSN}`,
    };

    expect(
      maskGDPRData({
        foo: { bar: text1 + ssn1 + text2 },
        baz: `${ssn1}0${ssn2}`,
      })
    ).toEqual(expectedResult);

    expect(
      maskGDPRData({
        foo: { bar: text1 + ssn1.toLowerCase() + text2 },
        baz: `${ssn1.toLowerCase()}0${ssn2.toLowerCase()}`,
      })
    ).toEqual(expectedResult);

    expect(
      maskGDPRData({
        foo: { bar: text1 + ssn1.toUpperCase() + text2 },
        baz: `${ssn1.toUpperCase()}0${ssn2.toUpperCase()}`,
      })
    ).toEqual(expectedResult);
  });
});
