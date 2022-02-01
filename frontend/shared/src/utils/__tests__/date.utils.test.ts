import { diffMonths, parseDate } from '../date.utils';

describe('dates', () => {
  describe('diffMonths', () => {
    it('should be 0 if dates are equal', () => {
      const diffMonthsResult = diffMonths(
        parseDate('1.12.2020'),
        parseDate('1.12.2020')
      );
      expect(diffMonthsResult).toBe(0);
    });
    it('should be 12.13 months between 1.01.2021 and 31.12.2021', () => {
      const diffMonthsResult = diffMonths(
        parseDate('31.12.2021'),
        parseDate('1.01.2021')
      );
      expect(diffMonthsResult).toBe(12.13);
    });
    it('should be -12.13 (negative difference) months between 31.12.2021 and 1.01.2021', () => {
      const diffMonthsResult = diffMonths(
        parseDate('1.01.2021'),
        parseDate('31.12.2021')
      );
      expect(diffMonthsResult).toStrictEqual(-12.13);
    });
  });
});
