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

// eslint-disable-next-line unicorn/prefer-set-has
const SUBTOTAL_CALCULATION_ROW_TYPES = [
  CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR,
  CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_SUB_TOTAL_EUR
];

export const groupCalculatorRows = (rows: Row[]): Row[][] => {
  const sections: Array<Array<Row>> = [];
  for (let start = 0, end = 0; start < rows.length; end = start) {
    const firstRow = rows[start];
    if (SUBTOTAL_CALCULATION_ROW_TYPES.includes(firstRow.rowType)) {
      // Select all subtotal lines into combined groups
      while (SUBTOTAL_CALCULATION_ROW_TYPES.includes(rows[end]?.rowType)) {
        end += 1;
      }
      sections.push(rows.slice(start, end));
      start = end;
    } else if (
      firstRow.rowType === CALCULATION_ROW_TYPES.DESCRIPTION &&
      firstRow.descriptionType === CALCULATION_ROW_DESCRIPTION_TYPES.DATE
    ) {
      // Select all date description rows into their own groups
      start += 1;
      sections.push([firstRow]);
    } else {
      // Select all other rows that don't fall into the above groups into combined groups
      end += 1;
      while (
        rows[end]
        && rows[end]?.rowType !== CALCULATION_ROW_TYPES.DESCRIPTION
        && !SUBTOTAL_CALCULATION_ROW_TYPES.includes(rows[end]?.rowType)) {
        end += 1;
      }
      sections.push(rows.slice(start, end));
      start = end;
    }
  }

  return sections;
}
