import {
  CALCULATION_ROW_DESCRIPTION_TYPES,
  CALCULATION_ROW_TYPES,
} from 'benefit-shared/constants';
import { Row } from 'benefit-shared/types/application';

import { extractCalculatorRows, groupCalculatorRows } from '../calculator';

const createRow = (overrides: Partial<Row>): Row => ({
  id: overrides.id ?? 'row-id',
  rowType: overrides.rowType ?? CALCULATION_ROW_TYPES.SALARY_COSTS_EUR,
  ordering: overrides.ordering ?? 0,
  descriptionFi: overrides.descriptionFi ?? 'row',
  amount: overrides.amount ?? '10',
  descriptionType: overrides.descriptionType ?? null,
  startDate: overrides.startDate,
  endDate: overrides.endDate,
});

describe('calculator utils', () => {
  describe('extractCalculatorRows', () => {
    it('extracts total rows and keeps original input intact', () => {
      const dateDescription = createRow({
        id: 'date-description',
        rowType: CALCULATION_ROW_TYPES.DESCRIPTION,
        descriptionType: CALCULATION_ROW_DESCRIPTION_TYPES.DATE,
      });
      const monthlyBenefit = createRow({
        id: 'monthly-benefit',
        rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR,
      });
      const salaryCosts = createRow({
        id: 'salary-costs',
        rowType: CALCULATION_ROW_TYPES.SALARY_COSTS_EUR,
      });
      const totalDescription = createRow({
        id: 'total-description',
        rowType: CALCULATION_ROW_TYPES.DESCRIPTION,
        descriptionType: CALCULATION_ROW_DESCRIPTION_TYPES.DATE_TOTAL,
      });
      const totalRow = createRow({
        id: 'total-row',
        rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_TOTAL_EUR,
      });

      const originalRows: Row[] = [
        dateDescription,
        monthlyBenefit,
        salaryCosts,
        totalDescription,
        totalRow,
      ];

      const result = extractCalculatorRows(originalRows);

      expect(result.rowsWithoutTotal).toEqual([
        dateDescription,
        monthlyBenefit,
        salaryCosts,
      ]);
      expect(result.totalRowDescription).toEqual(totalDescription);
      expect(result.totalRow).toEqual(totalRow);
      expect(result.dateRangeRows).toEqual([dateDescription]);
      expect(result.helsinkiBenefitMonthlyRows).toEqual([monthlyBenefit]);

      // Ensure extraction does not mutate caller input.
      expect(originalRows).toHaveLength(5);
      expect(originalRows[3]).toEqual(totalDescription);
      expect(originalRows[4]).toEqual(totalRow);
    });
  });

  describe('groupCalculatorRows', () => {
    it('groups rows by date descriptions, subtotal ranges, and normal ranges', () => {
      const normalA = createRow({
        id: 'normal-a',
        rowType: CALCULATION_ROW_TYPES.SALARY_COSTS_EUR,
      });
      const normalB = createRow({
        id: 'normal-b',
        rowType: CALCULATION_ROW_TYPES.PAY_SUBSIDY_MONTHLY_EUR,
      });
      const dateDescription = createRow({
        id: 'date-description',
        rowType: CALCULATION_ROW_TYPES.DESCRIPTION,
        descriptionType: CALCULATION_ROW_DESCRIPTION_TYPES.DATE,
      });
      const subtotalA = createRow({
        id: 'subtotal-a',
        rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR,
      });
      const subtotalB = createRow({
        id: 'subtotal-b',
        rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
      });
      const normalC = createRow({
        id: 'normal-c',
        rowType: CALCULATION_ROW_TYPES.TRAINING_COMPENSATION_MONTHLY_EUR,
      });

      const result = groupCalculatorRows([
        normalA,
        normalB,
        dateDescription,
        subtotalA,
        subtotalB,
        normalC,
      ]);

      expect(result).toEqual([
        [normalA, normalB],
        [dateDescription],
        [subtotalA, subtotalB],
        [normalC],
      ]);
    });

    it('groups consecutive subtotal rows from the beginning as one section', () => {
      const subtotalA = createRow({
        id: 'subtotal-a',
        rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR,
      });
      const subtotalB = createRow({
        id: 'subtotal-b',
        rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
      });
      const normal = createRow({
        id: 'normal',
        rowType: CALCULATION_ROW_TYPES.SALARY_COSTS_EUR,
      });

      const result = groupCalculatorRows([subtotalA, subtotalB, normal]);

      expect(result).toEqual([[subtotalA, subtotalB], [normal]]);
    });
  });
});
