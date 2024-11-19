import { $Section } from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import {
  ALTERATION_STATE,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { IconArrowRight, Tooltip } from 'hds-react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { renderInstalmentTagPerStatus } from '../../applicationList/ApplicationListForInstalments';
import {
  $Column,
  $Wrapper,
} from '../actions/handlingApplicationActions/HandlingApplicationActions.sc';
import { $CalculatorTableRow, $RowWrap } from '../ApplicationReview.sc';
import useInstalmentAccordionSections from './useInstalmentAccordionSections';

type Props = {
  data: Application;
};

const InstalmentAccordionSections: React.FC<Props> = ({ data }) => {
  const translationsBase = 'common:calculators.result';
  const { t } = useTranslation();

  const secondInstalmentText = data.pendingInstalment ? (
    <>
      {t(`${translationsBase}.secondInstalment`)}{' '}
      {convertToUIDateFormat(data.pendingInstalment.dueDate)}
    </>
  ) : null;

  const { amounts, areInstalmentsPaid, isSecondInstalmentReduced } =
    useInstalmentAccordionSections(data);

  return (
    <>
      <$Section className="">
        <$CalculatorTableRow>
          <$ViewField>{t(`${translationsBase}.firstInstalment`)}</$ViewField>
          {data.pendingInstalment &&
            formatFloatToCurrency(amounts.firstInstalment, 'EUR', 'fi-FI', 0)}
          {!data.pendingInstalment &&
            formatFloatToCurrency(
              data.calculatedBenefitAmount,
              'EUR',
              'fi-FI',
              0
            )}
        </$CalculatorTableRow>
      </$Section>

      {data.pendingInstalment && (
        <$Section>
          <$CalculatorTableRow>
            <$ViewField>
              {[
                INSTALMENT_STATUSES.WAITING,
                INSTALMENT_STATUSES.ERROR_IN_TALPA,
                INSTALMENT_STATUSES.CANCELLED,
                INSTALMENT_STATUSES.ACCEPTED,
              ].includes(
                data.pendingInstalment?.status as INSTALMENT_STATUSES
              ) ? (
                <Link href="/?tab=6">{secondInstalmentText}</Link>
              ) : (
                secondInstalmentText
              )}
            </$ViewField>
            <$RowWrap>
              {renderInstalmentTagPerStatus(t, data.pendingInstalment)}

              {(isSecondInstalmentReduced || !areInstalmentsPaid) && (
                <>
                  <div
                    style={{
                      textDecoration:
                        areInstalmentsPaid && isSecondInstalmentReduced
                          ? 'line-through'
                          : 'none',
                    }}
                  >
                    {isSecondInstalmentReduced &&
                      formatFloatToCurrency(
                        data.pendingInstalment?.amount,
                        'EUR',
                        'fi-FI',
                        0
                      )}
                  </div>
                  {isSecondInstalmentReduced && <IconArrowRight />}
                </>
              )}

              {formatFloatToCurrency(
                amounts.secondInstalment,
                'EUR',
                'fi-FI',
                0
              )}
            </$RowWrap>
          </$CalculatorTableRow>
        </$Section>
      )}

      {amounts.alterations > 0 && (
        <>
          <hr />

          {data.alterations
            .filter(
              (alteration) => alteration.state === ALTERATION_STATE.HANDLED
            )
            .map((alteration) => (
              <$Section className="recoverable">
                <$CalculatorTableRow>
                  <$ViewField>
                    {t(`${translationsBase}.alterationRow`, {
                      startDate: convertToUIDateFormat(
                        alteration.recoveryStartDate
                      ),
                      endDate: convertToUIDateFormat(
                        alteration.recoveryEndDate
                      ),
                    })}
                  </$ViewField>
                  <$RowWrap>
                    {formatFloatToCurrency(
                      alteration.recoveryAmount,
                      'EUR',
                      'fi-FI',
                      0
                    )}
                  </$RowWrap>
                </$CalculatorTableRow>
              </$Section>
            ))}

          <$Section className="recoverable">
            <$CalculatorTableRow>
              <$ViewField isBold>
                {t(`${translationsBase}.totalRecoveries`)}
              </$ViewField>
              <$RowWrap>
                {formatFloatToCurrency(amounts.alterations, 'EUR', 'fi-FI', 0)}
              </$RowWrap>
            </$CalculatorTableRow>
          </$Section>
        </>
      )}
      <hr />

      {amounts.secondInstalment - amounts.alterations < 0 &&
        areInstalmentsPaid && (
          <>
            <$Section className="">
              <$CalculatorTableRow>
                <$ViewField isBold>
                  {data.pendingInstalment?.status ===
                    INSTALMENT_STATUSES.COMPLETED || !data.pendingInstalment
                    ? t(`${translationsBase}.totalPaidSum`)
                    : t(`${translationsBase}.totalPlannedSum`)}
                </$ViewField>
                {formatFloatToCurrency(amounts.total, 'EUR', 'fi-FI', 0)}
              </$CalculatorTableRow>
            </$Section>
            <$Section className="">
              <$CalculatorTableRow>
                <$ViewField isBold>
                  <$Wrapper>
                    <$Column>
                      {t(`${translationsBase}.unpaidRecoveries.title`)}
                      <Tooltip placement="top">
                        {t(`${translationsBase}.unpaidRecoveries.tooltip`)}
                      </Tooltip>
                    </$Column>
                  </$Wrapper>
                </$ViewField>
                {formatFloatToCurrency(
                  amounts.secondInstalmentMax - amounts.alterations,
                  'EUR',
                  'fi-FI',
                  0
                )}
              </$CalculatorTableRow>
            </$Section>
            <hr />
          </>
        )}

      <$Section className="">
        <$CalculatorTableRow>
          <$ViewField isBold>
            {t(`${translationsBase}.totalAfterRecoveries`)}
          </$ViewField>
          {formatFloatToCurrency(
            amounts.totalAfterRecoveries,
            'EUR',
            'fi-FI',
            0
          )}
        </$CalculatorTableRow>
      </$Section>
    </>
  );
};

export default InstalmentAccordionSections;
