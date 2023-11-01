import { CALCULATION_PER_MONTH_ROW_TYPES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import {
  CALCULATION_ROW_DESCRIPTION_TYPES,
  CALCULATION_ROW_TYPES,
} from 'benefit-shared/constants';
import { Koros } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $CalculatorTableHeader,
  $CalculatorTableRow,
  $Highlight,
} from '../../ApplicationReview.sc';

const SalaryCalculatorResults: React.FC<ApplicationReviewViewProps> = ({
  data,
}) => {
  const theme = useTheme();
  const translationsBase = 'common:calculators.result';
  const { t } = useTranslation();
  const { rowsWithoutTotal, totalRow, totalRowDescription } =
    extractCalculatorRows(data?.calculation?.rows);
  if (rowsWithoutTotal.length > 0) {
    return (
      <$GridCell
        $colSpan={11}
        style={{ backgroundColor: 'white', padding: '20px' }}
      >
        {totalRow && totalRowDescription && (
          <>
            <$CalculatorTableHeader>
              {t(`${translationsBase}.header`)}
            </$CalculatorTableHeader>
            <$Highlight>
              <div style={{ fontSize: theme.fontSize.body.xl }}>
                {totalRowDescription.descriptionFi}
              </div>
              <div style={{ fontSize: theme.fontSize.heading.xl }}>
                {formatFloatToCurrency(totalRow.amount, 'EUR', 'fi-FI', 0)}
              </div>
            </$Highlight>
            <hr style={{ margin: theme.spacing.s }} />
          </>
        )}
        <$CalculatorTableHeader style={{ paddingBottom: theme.spacing.m }}>
          {t(`${translationsBase}.header2`)}
        </$CalculatorTableHeader>
        {rowsWithoutTotal.map((row) => {
          const isDateRange =
            CALCULATION_ROW_DESCRIPTION_TYPES.DATE === row.descriptionType;
          const isDescriptionRowType =
            CALCULATION_ROW_TYPES.DESCRIPTION === row.rowType;
          const isPerMonth = CALCULATION_PER_MONTH_ROW_TYPES.includes(
            row.rowType
          );
          return (
            <div key={row.id}>
              {CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR ===
                row.rowType && (
                <$CalculatorTableRow>
                  <$ViewField isBold>
                    {t(`${translationsBase}.acceptedBenefit`)}
                  </$ViewField>
                </$CalculatorTableRow>
              )}
              <$CalculatorTableRow isNewSection={isDateRange}>
                <$ViewField
                  isBold={isDateRange || isDescriptionRowType}
                  isBig={isDateRange}
                >
                  {row.descriptionFi}
                </$ViewField>
                {!isDescriptionRowType && (
                  <$ViewField isBold>
                    {formatFloatToCurrency(row.amount)}
                    {isPerMonth && t('common:utility.perMonth')}
                  </$ViewField>
                )}
              </$CalculatorTableRow>
            </div>
          );
        })}
        <Koros
          dense
          type="pulse"
          style={{
            fill: theme.colors.coatOfArmsLight,
            margin: '20px -20px -40px -20px',
            width: 'calc(100% + 40px)',
          }}
        />
      </$GridCell>
    );
  }
  return null;
};

export default SalaryCalculatorResults;
