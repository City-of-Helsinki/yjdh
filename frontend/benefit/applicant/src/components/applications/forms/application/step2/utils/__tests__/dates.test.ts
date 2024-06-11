import {
  getMaxEndDate,
  getMinEndDate,
  validateDateWithinMonths,
} from '@frontend/benefit-shared/src/utils/dates';

describe('dates', () => {
  describe('getMinEndDate', () => {
    it('should be one month minus one day after the start date for Salary benefits', () => {
      const minEndDate = getMinEndDate('1.12.2020');

      expect(minEndDate).toStrictEqual(new Date(2020, 11, 31));
    });
  });

  describe('getMaxEndDate', () => {
    it('should be one year minus one day after the start date for Salary benefits', () => {
      const maxEndDate = getMaxEndDate('1.12.2020');

      expect(maxEndDate).toStrictEqual(new Date(2021, 10, 30));
    });
  });

  describe('validateDateWithinFourMonths', () => {
    it('should return true when date is exactly four months ago', () => {
      const fourMonthsAgo = new Date();
      fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

      expect(validateDateWithinMonths(fourMonthsAgo, 4)).toBe(true);
    });

    it('should return true when date is within four months', () => {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      expect(validateDateWithinMonths(twoMonthsAgo, 4)).toBe(true);
    });

    it('should return true when date is two months in the future', () => {
      const twoMonthsInTheFuture = new Date();
      twoMonthsInTheFuture.setMonth(twoMonthsInTheFuture.getMonth() + 2);

      expect(validateDateWithinMonths(twoMonthsInTheFuture, 4)).toBe(true);
    });

    it('should return false when date is more than four months in the past', () => {
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

      expect(validateDateWithinMonths(fiveMonthsAgo, 4)).toBe(false);
    });
  });
});
