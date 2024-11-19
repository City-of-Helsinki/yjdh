import {
  $CalculatorContainer,
  $DecisionCalculatorAccordion,
  $DecisionCalculatorAccordionIconContainer,
  $Section,
} from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import SalaryCalculatorHighlight from 'benefit/handler/components/applicationReview/salaryBenefitCalculatorView/SalaryCalculatorResults/SalaryCalculatorHighlight';
import { CALCULATION_PER_MONTH_ROW_TYPES } from 'benefit/handler/constants';
import {
  extractCalculatorRows,
  groupCalculatorRows,
} from 'benefit/handler/utils/calculator';
import {
  CALCULATION_ROW_DESCRIPTION_TYPES,
  CALCULATION_ROW_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Accordion, IconGlyphEuro, IconMoneyBag } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import {
  $CalculatorTableHeader,
  $CalculatorTableRow,
} from '../ApplicationReview.sc';
import InstalmentAccordionSections from './InstalmentAccordionSections';

type Props = {
  data: Application;
};

const DecisionCalculationAccordion: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const translationsBase = 'common:calculators.result';
  const { t } = useTranslation();
  const { rowsWithoutTotal, totalRow, totalRowDescription } =
    extractCalculatorRows(data?.calculation?.rows);

  // Group rows into sections to give monthly subtotals a separate background color
  const sections = groupCalculatorRows(rowsWithoutTotal);

  const headingSize = { fontSize: theme.fontSize.heading.l };

  return (
    <>
      <$DecisionCalculatorAccordion>
        <$DecisionCalculatorAccordionIconContainer aria-hidden="true">
          <IconGlyphEuro />
        </$DecisionCalculatorAccordionIconContainer>
        <Accordion
          heading={t('common:applications.decision.calculation')}
          card
          size="s"
        >
          <$GridCell
            $colSpan={11}
            style={{
              padding: theme.spacing.m,
            }}
          >
            <$CalculatorContainer>
              {totalRow && (
                <>
                  <$CalculatorTableHeader css={headingSize}>
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
              <$CalculatorTableHeader
                style={{ paddingBottom: theme.spacing.m }}
                css={headingSize}
              >
                {t(`${translationsBase}.header2`)}
              </$CalculatorTableHeader>
              {sections.map((section) => {
                const firstRowIsMonthSubtotal = [
                  CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_MONTHLY_EUR,
                  CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
                ].includes(section[0]?.rowType);

                return (
                  <$Section
                    key={section[0].id || 'filler'}
                    className={firstRowIsMonthSubtotal ? 'subtotal' : ''}
                  >
                    {section.map((row) => {
                      const isDateRange =
                        CALCULATION_ROW_DESCRIPTION_TYPES.DATE ===
                        row.descriptionType;
                      const isDescriptionRowType =
                        CALCULATION_ROW_TYPES.DESCRIPTION === row.rowType;

                      const isPerMonth =
                        CALCULATION_PER_MONTH_ROW_TYPES.includes(row.rowType);
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
                  </$Section>
                );
              })}
            </$CalculatorContainer>
          </$GridCell>
        </Accordion>
      </$DecisionCalculatorAccordion>

      <$DecisionCalculatorAccordion>
        <$DecisionCalculatorAccordionIconContainer aria-hidden="true">
          <IconMoneyBag />
        </$DecisionCalculatorAccordionIconContainer>
        <Accordion
          heading={t('common:applications.decision.instalments')}
          card
          size="s"
        >
          <$GridCell
            $colSpan={11}
            style={{
              padding: theme.spacing.m,
            }}
          >
            <$CalculatorContainer>
              <InstalmentAccordionSections data={data} />
            </$CalculatorContainer>
          </$GridCell>
        </Accordion>
      </$DecisionCalculatorAccordion>
    </>
  );
};

export default DecisionCalculationAccordion;
