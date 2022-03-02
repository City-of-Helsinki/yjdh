import {
  days360,
  diffMonths,
  getCorrectEndDate,
  isLeapYear,
  parseDate,
  validateDateIsFromCurrentYearOnwards,
} from '../date.utils';

describe('dates', () => {
  describe('isLeapYear', () => {
    it('should be leap year', () => {
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2012)).toBe(true);
    });
  });

  describe('days360', () => {
    it('should be expected result', () => {
      expect(days360(parseDate('1.9.2021'), parseDate('1.10.2021'))).toBe(30);
      expect(days360(parseDate('1.9.2021'), parseDate('30.9.2021'))).toBe(29);
      expect(days360(parseDate('1.8.2021'), parseDate('2.9.2021'))).toBe(31);
      expect(days360(parseDate('1.8.2021'), parseDate('31.8.2021'))).toBe(29);
      expect(days360(parseDate('1.8.2021'), parseDate('29.8.2021'))).toBe(28);
      expect(days360(parseDate('16.9.2021'), parseDate('11.12.2021'))).toBe(85);
      expect(days360(parseDate('10.12.2021'), parseDate('20.3.2022'))).toBe(
        100
      );
      expect(days360(parseDate('1.12.2021'), parseDate('1.12.2022'))).toBe(360);
    });
  });

  describe('diffMonths', () => {
    it('should be 12 months between 1.1.2021 and 31.12.2021', () => {
      const diffMonthsResult = diffMonths(
        parseDate('31.12.2021'),
        parseDate('1.1.2021')
      );
      expect(diffMonthsResult).toBe(12);
    });
    it('should be negative difference months between 31.12.2021 and 1.01.2021', () => {
      const diffMonthsResult = diffMonths(
        parseDate('1.1.2021'),
        parseDate('31.12.2021')
      );
      expect(diffMonthsResult).toBeLessThan(0);
    });
  });

  describe('getCorrectEndDate', () => {
    it('should be expected result', () => {
      expect(getCorrectEndDate('31.12.2022', '1.1.2021')).toBe('31.12.2022');
      expect(getCorrectEndDate('31.12.2021', '1.1.2023')).toBe('1.1.2023');
      expect(getCorrectEndDate('31.12.', '1.1.2021')).toBeUndefined();
      expect(getCorrectEndDate('31.12.', '2021')).toBeUndefined();
    });
  });

  describe('validateDateIsFromCurrentYearOnwards', () => {
    const currentYear = new Date().getFullYear();
    it('should return false', () => {
      expect(
        validateDateIsFromCurrentYearOnwards(`31.12.${currentYear - 1}`)
      ).toBe(false);
      expect(
        validateDateIsFromCurrentYearOnwards(`2.1.${currentYear - 4}`)
      ).toBe(false);
      expect(
        validateDateIsFromCurrentYearOnwards(`4.8.${currentYear - 2}`)
      ).toBe(false);
    });
    it('should return true', () => {
      expect(validateDateIsFromCurrentYearOnwards(`1.1.${currentYear}`)).toBe(
        true
      );
      expect(
        validateDateIsFromCurrentYearOnwards(`3.4.${currentYear + 5}`)
      ).toBe(true);
    });
  });
});
