import SalaryCalculatorHighlight from 'benefit/handler/components/applicationReview/salaryBenefitCalculatorView/SalaryCalculatorResults/SalaryCalculatorHighlight';
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
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $CalculatorTableHeader,
  $CalculatorTableRow,
} from '../../ApplicationReview.sc';

const SalaryCalculatorResults: React.FC<ApplicationReviewViewProps> = ({
  data,
  isManualCalculator,
  isRecalculationRequired,
}) => {
  const theme = useTheme();
  const translationsBase = 'common:calculators.result';
  const { t } = useTranslation();
  const { rowsWithoutTotal, totalRow, totalRowDescription } =
    extractCalculatorRows(data?.calculation?.rows);

  if (isRecalculationRequired) {
    return null;
  }

  if (rowsWithoutTotal.length === 0 && !isManualCalculator) {
    return null;
  }

  return (
    <$GridCell
      $colSpan={11}
      style={{
        backgroundColor: 'white',
        margin: `0 ${theme.spacing.xl4}`,
        padding: `${theme.spacing.l} ${theme.spacing.xl4}`,
      }}
    >
      {totalRow && (
        <>
          <$CalculatorTableHeader>
            {t(`${translationsBase}.header`)}
          </$CalculatorTableHeader>
          <SalaryCalculatorHighlight
            testId="calculation-results-total"
            description={
              totalRowDescription
                ? totalRowDescription.descriptionFi
                : totalRow?.descriptionFi
            }
            amount={totalRow.amount}
          />
          <hr style={{ margin: theme.spacing.s }} />
        </>
      )}
      {!isManualCalculator && (
        <>
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
                <$CalculatorTableRow
                  isNewSection={isDateRange}
                  style={{
                    backgroundColor: !isDescriptionRowType
                      ? theme.colors.silverMediumLight
                      : 'transparent',
                    marginBottom: '7px',
                  }}
                >
                  <$ViewField
                    isBold={isDateRange || isDescriptionRowType}
                    isBig={isDateRange}
                  >
                    {row.descriptionFi}
                  </$ViewField>
                  {!isDescriptionRowType && (
                    <$ViewField
                      isBold
                      style={{ marginRight: theme.spacing.xl4 }}
                    >
                      {formatFloatToEvenEuros(row.amount)}
                      {isPerMonth && t('common:utility.perMonth')}
                    </$ViewField>
                  )}
                </$CalculatorTableRow>
              </div>
            );
          })}
        </>
      )}
      <Koros
        dense
        type="pulse"
        style={{
          fill: theme.colors.coatOfArmsLight,
          margin: `${theme.spacing.l} 0 -35px -65px`,
          width: 'calc(100% + 130px)',
        }}
      />
    </$GridCell>
  );
};

export default SalaryCalculatorResults;
