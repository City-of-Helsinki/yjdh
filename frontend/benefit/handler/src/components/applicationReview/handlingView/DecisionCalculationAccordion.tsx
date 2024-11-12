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
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Accordion, IconBagCogwheel, IconGlyphEuro } from 'hds-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { renderInstalmentTagPerStatus } from '../../applicationList/ApplicationListForInstalments';
import { isInPayment } from '../../applicationList/HandlerIndex';
import {
  $CalculatorTableHeader,
  $CalculatorTableRow,
} from '../ApplicationReview.sc';

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
  const secondInstalmentText = data.pendingInstalment ? (
    <>
      {' '}
      {t(`${translationsBase}.secondInstalment`)}{' '}
      {convertToUIDateFormat(data.pendingInstalment.dueDate)}
    </>
  ) : null;

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
                                {formatFloatToCurrency(row.amount)}
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
      {data.pendingInstalment && isInPayment(data) && (
        <$DecisionCalculatorAccordion>
          <$DecisionCalculatorAccordionIconContainer aria-hidden="true">
            <IconBagCogwheel />
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
                <$Section className="">
                  <$CalculatorTableRow>
                    <$ViewField>
                      {t(`${translationsBase}.firstInstalment`)}
                    </$ViewField>
                    {formatFloatToCurrency(
                      data.calculatedBenefitAmount -
                        data.pendingInstalment.amount,
                      'EUR',
                      'fi-FI',
                      0
                    )}{' '}
                  </$CalculatorTableRow>
                </$Section>
                <$Section className="">
                  <$CalculatorTableRow>
                    <$ViewField>
                      {[
                        INSTALMENT_STATUSES.WAITING,
                        INSTALMENT_STATUSES.ERROR_IN_TALPA,
                        INSTALMENT_STATUSES.CANCELLED,
                        INSTALMENT_STATUSES.ACCEPTED,
                      ].includes(
                        data.pendingInstalment.status as INSTALMENT_STATUSES
                      ) ? (
                        <Link href="/?tab=6">{secondInstalmentText}</Link>
                      ) : (
                        secondInstalmentText
                      )}
                    </$ViewField>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                      }}
                    >
                      {renderInstalmentTagPerStatus(t, data.pendingInstalment)}
                      {formatFloatToCurrency(
                        data.pendingInstalment.amount,
                        'EUR',
                        'fi-FI',
                        0
                      )}
                    </div>
                  </$CalculatorTableRow>
                </$Section>
                <$Section className="subtotal">
                  <$CalculatorTableRow>
                    <$ViewField isBold isBig>
                      {t(`${translationsBase}.total`)}
                    </$ViewField>
                    {formatFloatToCurrency(
                      data.calculatedBenefitAmount,
                      'EUR',
                      'fi-FI',
                      0
                    )}
                  </$CalculatorTableRow>
                </$Section>
              </$CalculatorContainer>
            </$GridCell>
          </Accordion>
        </$DecisionCalculatorAccordion>
      )}
    </>
  );
};

export default DecisionCalculationAccordion;
