import {
  getMaxEndDate,
  getMinEndDate,
  validateDateWithinMonths,
} from '@frontend/benefit-shared/src/utils/dates';
import { BENEFIT_TYPES } from 'benefit-shared/constants';

describe('dates', () => {
  const undefinedBenefit = undefined;
  const emptyBenefit = '';

  describe('getMinEndDate', () => {
    it('should be one month minus one day after the start date for Employment benefits', () => {
      const minEndDate = getMinEndDate('1.12.2020', BENEFIT_TYPES.EMPLOYMENT);

      expect(minEndDate).toStrictEqual(new Date(2020, 11, 31));
    });

    it('should be one month minus one day after the start date for Salary benefits', () => {
      const minEndDate = getMinEndDate('1.12.2020', BENEFIT_TYPES.SALARY);

      expect(minEndDate).toStrictEqual(new Date(2020, 11, 31));
    });

    it('should be the same as the start date for Commission benefits', () => {
      const minEndDate = getMinEndDate('1.12.2020', BENEFIT_TYPES.COMMISSION);

      expect(minEndDate).toStrictEqual(new Date(2020, 11, 1));
    });

    it('should be the same as the start date when benefit type is empty or undefined', () => {
      const minEndDate1 = getMinEndDate('1.12.2020', undefinedBenefit as '');
      const minEndDate2 = getMinEndDate('1.12.2020', emptyBenefit);

      expect(minEndDate1).toStrictEqual(new Date(2020, 11, 1));
      expect(minEndDate2).toStrictEqual(new Date(2020, 11, 1));
    });
  });

  describe('getMaxEndDate', () => {
    it('should be one year minus one day after the start date for Employment benefits', () => {
      const maxEndDate = getMaxEndDate('1.12.2020', BENEFIT_TYPES.EMPLOYMENT);

      expect(maxEndDate).toStrictEqual(new Date(2021, 10, 30));
    });

    it('should be one year minus one day after the start date for Salary benefits', () => {
      const maxEndDate = getMaxEndDate('1.12.2020', BENEFIT_TYPES.SALARY);

      expect(maxEndDate).toStrictEqual(new Date(2021, 10, 30));
    });

    it('should be undefined for Commission benefits', () => {
      const maxEndDate = getMaxEndDate('1.12.2020', BENEFIT_TYPES.COMMISSION);

      expect(maxEndDate).toBeUndefined();
    });

    it('should be undefined when benefit type is empty or undefined', () => {
      const maxEndDate1 = getMaxEndDate('1.12.2020', undefinedBenefit as '');
      const maxEndDate2 = getMaxEndDate('1.12.2020', emptyBenefit);

      expect(maxEndDate1).toBeUndefined();
      expect(maxEndDate2).toBeUndefined();
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
