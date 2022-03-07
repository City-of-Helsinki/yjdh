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
import { $CalculatorTableRow } from '../../ApplicationReview.sc';

const SalaryCalculatorTable: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const translationsBase = 'common:calculators.employment';
  const { t } = useTranslation();
  return (
    <$GridCell $colSpan={7}>
      {data?.calculation?.rows &&
        data?.calculation?.rows.map((row) => {
          const isSummaryRowType = CALCULATION_SUMMARY_ROW_TYPES.includes(
            row.rowType
          );
          const isTotalRowType = CALCULATION_TOTAL_ROW_TYPE === row.rowType;
          const isDescriptionRowType =
            CALCULATION_DESCRIPTION_ROW_TYPES.includes(row.rowType);
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
        })}
    </$GridCell>
  );
};

export default SalaryCalculatorTable;
