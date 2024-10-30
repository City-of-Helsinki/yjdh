import { Calculation, Row } from 'benefit-shared/types/application';
import clone from 'lodash/clone';
import { convertToUIDateFormat, diffMonths } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

export type BenefitRow = {
  id: string;
  dates: string;
  amount: string;
  amountNumber: string;
  perMonth: string;
  duration: number;
  startDate: string;
  endDate: string;
};

type Props = {
  calculation: Calculation;
};

type CalculationTableProps = {
  tableRows: Array<BenefitRow>;
  totalSum: number;
};

const createBenefitRow = (): BenefitRow =>
  clone({
    id: '',
    dates: '',
    amount: '',
    amountNumber: '',
    perMonth: '',
    duration: 0,
    startDate: '',
    endDate: '',
  });

const reduceTableRows = (filteredData: Row[]): BenefitRow[] => {
  let perMonth = '';
  return filteredData.reduce((acc: BenefitRow[], row: Row) => {
    const tableRow = createBenefitRow();
    tableRow.id = row.id;
    if (row.rowType === 'helsinki_benefit_monthly_eur') {
      perMonth = `${formatFloatToCurrency(row.amount, 'EUR', 'fi-FI', 0)} / kk`;
    }
    if (row.rowType === 'helsinki_benefit_sub_total_eur') {
      tableRow.dates = `${convertToUIDateFormat(
        row.startDate
      )} - ${convertToUIDateFormat(row.endDate)}`;

      tableRow.endDate = convertToUIDateFormat(row.endDate);
      tableRow.startDate = convertToUIDateFormat(row.startDate);

      tableRow.duration = diffMonths(
        new Date(row.endDate),
        new Date(row.startDate)
      );

      tableRow.amount = formatFloatToCurrency(row.amount, 'EUR', 'fi-FI', 0);
      tableRow.amountNumber = row.amount;
      tableRow.perMonth = perMonth;
      acc.push(tableRow);
    }
    return acc;
  }, []);
};

const useCalculationTable = ({ calculation }: Props): CalculationTableProps => {
  const filteredData: Row[] = calculation.rows.filter((row) =>
    ['helsinki_benefit_monthly_eur', 'helsinki_benefit_sub_total_eur'].includes(
      row.rowType
    )
  );

  const duration =
    calculation?.rows?.length > 0
      ? diffMonths(
          new Date(calculation.rows.at(0).endDate),
          new Date(calculation.rows.at(0).startDate)
        )
      : 0;

  const tableRows: BenefitRow[] = calculation.overrideMonthlyBenefitAmount
    ? [
        {
          id: 'manual-calculation',
          dates: `${convertToUIDateFormat(
            calculation.rows.at(0).startDate
          )} - ${convertToUIDateFormat(calculation.rows.at(0).endDate)}`,
          duration,
          startDate: convertToUIDateFormat(calculation.rows.at(0).startDate),
          endDate: convertToUIDateFormat(calculation.rows.at(0).endDate),
          amount: formatFloatToCurrency(
            String(
              parseFloat(calculation.overrideMonthlyBenefitAmount as string) *
                duration
            ),
            'EUR',
            'fi-FI',
            0
          ),
          amountNumber: calculation.rows.at(0).amount,
          perMonth: `${formatFloatToCurrency(
            calculation.overrideMonthlyBenefitAmount,
            'EUR',
            'fi-FI',
            0
          )} / kk`,
        },
      ]
    : reduceTableRows(filteredData);

  const totalSum = tableRows.reduce(
    (acc: number, cur: BenefitRow) => acc + parseFloat(cur.amountNumber),
    0
  );

  if (tableRows.length > 0)
    tableRows.push({
      ...createBenefitRow(),
      id: 'table-footer',
      dates: `${tableRows.at(0).startDate} - ${tableRows.at(-1).endDate}`,
      // Summing up multiple duration periods may cause float number inaccuracies to accumulate;
      // formatting to two decimals and then casting back to a number should get rid of them
      // while also removing redundant trailing zeroes.
      // (Example case: the three ranges 1.5.2024 - 21.5.2024, 22.5.2024 - 21.7.2024,
      // 22.7.2024 - 28.12.2024 would otherwise show as 7.930000000000001 months total.)
      duration: parseFloat(
        tableRows
          .reduce((acc: number, cur: BenefitRow) => acc + cur.duration, 0)
          .toFixed(2)
      ),
      amount: formatFloatToCurrency(totalSum, 'EUR', 'fi-FI', 0),
    });

  return {
    tableRows,
    totalSum,
  };
};

export default useCalculationTable;
