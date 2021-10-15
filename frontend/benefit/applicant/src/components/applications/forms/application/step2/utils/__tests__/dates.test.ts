import { BENEFIT_TYPES } from 'benefit/applicant/constants';

import { getMaxEndDate,getMinEndDate } from '../dates';

describe('dates', () => {
  const undefinedBenefit = undefined;
  const emptyBenefit = '';

  describe('getMinEndDate', () => {
    it('should be one month minus one day after the start date for Employment benefits', () => {
      const minEndDate = getMinEndDate('1.1.2020', BENEFIT_TYPES.EMPLOYMENT);

      expect(minEndDate).toStrictEqual(new Date(2020, 0, 31));
    });

    it('should be one month minus one day after the start date for Salary benefits', () => {
      const minEndDate = getMinEndDate('1.1.2020', BENEFIT_TYPES.SALARY);

      expect(minEndDate).toStrictEqual(new Date(2020, 0, 31));
    });

    it('should be the same as the start date for Commission benefits', () => {
      const minEndDate = getMinEndDate('1.1.2020', BENEFIT_TYPES.COMMISSION);

      expect(minEndDate).toStrictEqual(new Date(2020, 0, 1));
    });

    it('should be the same as the start date when benefit type is empty or undefined', () => {
      const minEndDate1 = getMinEndDate('1.1.2020', undefinedBenefit);
      const minEndDate2 = getMinEndDate('1.1.2020', emptyBenefit);

      expect(minEndDate1).toStrictEqual(new Date(2020, 0, 1));
      expect(minEndDate2).toStrictEqual(new Date(2020, 0, 1));
    });
  });

  describe('getMaxEndDate', () => {
    it('should be one year minus one day after the start date for Employment benefits', () => {
      const maxEndDate = getMaxEndDate('1.1.2020', BENEFIT_TYPES.EMPLOYMENT);

      expect(maxEndDate).toStrictEqual(new Date(2020, 11, 31));
    });

    it('should be one year minus one day after the start date for Salary benefits', () => {
      const maxEndDate = getMaxEndDate('1.1.2020', BENEFIT_TYPES.SALARY);

      expect(maxEndDate).toStrictEqual(new Date(2020, 11, 31));
    });

    it('should be undefined for Commission benefits', () => {
      const maxEndDate = getMaxEndDate('1.1.2020', BENEFIT_TYPES.COMMISSION);

      expect(maxEndDate).toBeUndefined();
    });

    it('should be undefined when benefit type is empty or undefined', () => {
      const maxEndDate1 = getMaxEndDate('1.1.2020', undefinedBenefit);
      const maxEndDate2 = getMaxEndDate('1.1.2020', emptyBenefit);

      expect(maxEndDate1).toBeUndefined();
      expect(maxEndDate2).toBeUndefined();
    });
  });
});
