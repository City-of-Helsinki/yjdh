import {
  CALCULATION_ROW_DESCRIPTION_TYPES,
  CALCULATION_ROW_TYPES,
} from 'benefit-shared/constants';
import { Row } from 'benefit-shared/types/application';

type ExtractedCalculatorRowsType = {
  rowsWithoutTotal: Row[];
  totalRow: Row | undefined;
  totalRowDescription: Row | undefined;
  dateRangeRows: Row[];
  helsinkiBenefitMonthlyRows: Row[];
};

export const extractCalculatorRows = (
  originalRows: Row[]
): ExtractedCalculatorRowsType => {
  const rows: Row[] = JSON.parse(JSON.stringify(originalRows)) as Row[];
  const totalRow = rows.pop();
  const totalRowDescription = rows.pop();
  const dateRangeRows = rows.filter(
    (row) => row.descriptionType === CALCULATION_ROW_DESCRIPTION_TYPES.DATE
  );
  const helsinkiBenefitMonthlyRows = rows.filter(
    (row) => row.rowType === CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR
  );
  return {
    rowsWithoutTotal: rows,
    totalRow,
    totalRowDescription,
    dateRangeRows,
    helsinkiBenefitMonthlyRows,
  };
};
