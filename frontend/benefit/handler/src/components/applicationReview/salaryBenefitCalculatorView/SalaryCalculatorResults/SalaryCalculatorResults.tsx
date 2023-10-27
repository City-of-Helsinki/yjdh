import {
  CALCULATION_DESCRIPTION_ROW_TYPES,
  CALCULATION_SUMMARY_ROW_TYPES,
  CALCULATION_TOTAL_ROW_TYPE,
} from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatStringFloatValue } from 'shared/utils/string.utils';

import {
  $CalculatorTableHeader,
  $CalculatorTableRow,
} from '../../ApplicationReview.sc';

const SalaryCalculatorResults: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const translationsBase = 'common:calculators.employment';
  const { t } = useTranslation();
  const totalRowIndex = data?.calculation?.rows.findIndex(
    (row) => CALCULATION_TOTAL_ROW_TYPE === row.rowType
  );
  const totalRow = data?.calculation?.rows[totalRowIndex];
  const totalRowDescriptionIndex = data?.calculation?.rows.findIndex(
    (row) => row.ordering === totalRow.ordering - 1
  );
  const totalRowDescription = data?.calculation?.rows[totalRowDescriptionIndex];
  return (
    <$GridCell
      $colSpan={11}
      style={{ backgroundColor: 'white', padding: '20px' }}
    >
      {data?.calculation?.rows && (
        <>
          <$CalculatorTableHeader>Kala</$CalculatorTableHeader>
          {totalRow.amount}
          {totalRowDescription.descriptionFi}
        </>
      )}
      {data?.calculation?.rows.map((row) => {
        const isSummaryRowType = CALCULATION_SUMMARY_ROW_TYPES.includes(
          row.rowType
        );
        const isTotalRowType = CALCULATION_TOTAL_ROW_TYPE === row.rowType;
        const isDescriptionRowType = CALCULATION_DESCRIPTION_ROW_TYPES.includes(
          row.rowType
        );
        if (row !== totalRow && row !== totalRowDescription) {
          return (
            <div key={row.id}>
              <$CalculatorTableRow isTotal={isSummaryRowType}>
                <$ViewField isBold={isTotalRowType || isDescriptionRowType}>
                  {row.descriptionFi}
                </$ViewField>
                {!isDescriptionRowType && (
                  <$ViewField isBold={isTotalRowType}>
                    {t(`${translationsBase}.tableRowValue`, {
                      amount: formatStringFloatValue(row.amount),
                    })}
                  </$ViewField>
                )}
              </$CalculatorTableRow>
            </div>
          );
        }
        return null;
      })}
    </$GridCell>
  );
};

export default SalaryCalculatorResults;
