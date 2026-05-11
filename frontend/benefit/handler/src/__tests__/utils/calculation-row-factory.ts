import {
  CALCULATION_ROW_DESCRIPTION_TYPES,
  CALCULATION_ROW_TYPES,
} from 'benefit-shared/constants';
import { Row } from 'benefit-shared/types/application';

export const createCalculatorRow = (overrides: Partial<Row> = {}): Row => ({
  id: overrides.id ?? 'row-1',
  rowType: overrides.rowType ?? CALCULATION_ROW_TYPES.SALARY_COSTS_EUR,
  ordering: overrides.ordering ?? 0,
  descriptionFi: overrides.descriptionFi ?? 'row',
  amount: overrides.amount ?? '0',
  descriptionType: overrides.descriptionType ?? null,
  startDate: overrides.startDate,
  endDate: overrides.endDate,
});

type BuildAcceptedBenefitRowsOptions = {
  includeDateRange?: boolean;
  dateRangeDescriptionFi?: string;
  monthlyDescriptionFi?: string;
  monthlyAmount?: string;
  totalDescriptionFi?: string;
  totalRowDescriptionFi?: string;
  totalRowAmount?: string;
};

export const buildAcceptedBenefitRows = ({
  includeDateRange = false,
  dateRangeDescriptionFi = 'Ajalta 1.1.2024 - 31.1.2024',
  monthlyDescriptionFi = 'Monthly benefit',
  monthlyAmount = '123',
  totalDescriptionFi = 'Total description',
  totalRowDescriptionFi = 'Total row',
  totalRowAmount = '999',
}: BuildAcceptedBenefitRowsOptions = {}): Row[] => {
  const rows: Row[] = [];

  if (includeDateRange) {
    rows.push(
      createCalculatorRow({
        id: 'date-range',
        rowType: CALCULATION_ROW_TYPES.DESCRIPTION,
        descriptionType: CALCULATION_ROW_DESCRIPTION_TYPES.DATE,
        descriptionFi: dateRangeDescriptionFi,
      })
    );
  }

  rows.push(
    createCalculatorRow({
      id: 'monthly-row',
      rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR,
      descriptionFi: monthlyDescriptionFi,
      amount: monthlyAmount,
    }),
    createCalculatorRow({
      id: 'total-description',
      rowType: CALCULATION_ROW_TYPES.DESCRIPTION,
      descriptionType: CALCULATION_ROW_DESCRIPTION_TYPES.DATE_TOTAL,
      descriptionFi: totalDescriptionFi,
      amount: '0',
    }),
    createCalculatorRow({
      id: 'total-row',
      rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_TOTAL_EUR,
      descriptionFi: totalRowDescriptionFi,
      amount: totalRowAmount,
    })
  );

  return rows;
};
