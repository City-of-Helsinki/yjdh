import { $Section } from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion.sc';
import useInstalmentStatusTransition from 'benefit/handler/hooks/useInstalmentStatusTransition';
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
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

import { renderPaymentTagPerStatus } from '../../applicationList/ApplicationList';
import { renderInstalmentTagPerStatus } from '../../applicationList/ApplicationListForInstalments';
import TalpaStatusChangeModal from '../../applicationList/TalpaStatusChangeDialog';
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
  const [showTalpaModal, setShowTaplaModal] = React.useState(false);
  const {
    mutate: changeInstalmentStatus,
    isSuccess: isInstalmentStatusChanged,
  } = useInstalmentStatusTransition();

  React.useEffect(() => {
    if (isInstalmentStatusChanged) {
      setShowTaplaModal(false);
    }
  }, [isInstalmentStatusChanged]);

  const handleTalpaStatusChange = (talpaStatus: INSTALMENT_STATUSES): void => {
    changeInstalmentStatus({
      id: data?.firstInstalment?.id,
      status: talpaStatus,
    });
  };
  const secondInstalmentText = data.secondInstalment ? (
    <>
      {t(`${translationsBase}.secondInstalment`)}{' '}
      {convertToUIDateFormat(data.secondInstalment.dueDate)}
    </>
  ) : null;

  const { amounts, areInstalmentsPaid, isSecondInstalmentReduced } =
    useInstalmentAccordionSections(data);

  const onTalpaTagClick = (): void => {
    setShowTaplaModal(true);
  };

  return (
    <>
      <$Section>
        <$CalculatorTableRow>
          <$ViewField>{t(`${translationsBase}.firstInstalment`)}</$ViewField>

          <$RowWrap>
            {renderPaymentTagPerStatus(
              t,
              data.talpaStatus,
              data?.firstInstalment?.id,
              onTalpaTagClick
            )}
            <div>{formatFloatToEvenEuros(amounts.firstInstalment)}</div>
          </$RowWrap>
        </$CalculatorTableRow>
      </$Section>

      {data.secondInstalment && (
        <$Section>
          <$CalculatorTableRow>
            <$ViewField>
              {[
                INSTALMENT_STATUSES.WAITING,
                INSTALMENT_STATUSES.ERROR_IN_TALPA,
                INSTALMENT_STATUSES.CANCELLED,
                INSTALMENT_STATUSES.ACCEPTED,
              ].includes(
                data.secondInstalment?.status as INSTALMENT_STATUSES
              ) ? (
                <Link href="/?tab=6">{secondInstalmentText}</Link>
              ) : (
                secondInstalmentText
              )}
            </$ViewField>
            <$RowWrap>
              {renderInstalmentTagPerStatus(
                t,
                data.secondInstalment?.status as INSTALMENT_STATUSES
              )}

              {isSecondInstalmentReduced && (
                <>
                  <div
                    style={{
                      textDecoration: areInstalmentsPaid
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    {formatFloatToEvenEuros(amounts.secondInstalmentMax)}
                  </div>
                  <IconArrowRight />
                </>
              )}

              {formatFloatToEvenEuros(amounts.secondInstalment)}
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
                    {formatFloatToEvenEuros(alteration.recoveryAmount)}
                  </$RowWrap>
                </$CalculatorTableRow>
              </$Section>
            ))}

          <$Section className="recoverable">
            <$CalculatorTableRow>
              <$ViewField isBold>
                {t(`${translationsBase}.totalRecoveries`)}
              </$ViewField>
              <$RowWrap>{formatFloatToEvenEuros(amounts.alterations)}</$RowWrap>
            </$CalculatorTableRow>
          </$Section>
        </>
      )}
      <hr />

      {amounts.secondInstalment - amounts.alterations < 0 &&
        areInstalmentsPaid && (
          <>
            <$Section>
              <$CalculatorTableRow>
                <$ViewField isBold>
                  {data.secondInstalment?.status ===
                    INSTALMENT_STATUSES.COMPLETED || !data.secondInstalment
                    ? t(`${translationsBase}.totalPaidSum`)
                    : t(`${translationsBase}.totalPlannedSum`)}
                </$ViewField>
                {formatFloatToEvenEuros(amounts.total)}
              </$CalculatorTableRow>
            </$Section>
            <$Section>
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
                {formatFloatToEvenEuros(
                  amounts.secondInstalmentMax - amounts.alterations
                )}
              </$CalculatorTableRow>
            </$Section>
            <hr />
          </>
        )}

      <$Section>
        <$CalculatorTableRow>
          <$ViewField isBold>
            {t(`${translationsBase}.totalAfterRecoveries`)}
          </$ViewField>
          {formatFloatToEvenEuros(amounts.totalAfterRecoveries)}
        </$CalculatorTableRow>
      </$Section>

      <TalpaStatusChangeModal
        isOpen={showTalpaModal}
        onClose={() => setShowTaplaModal(false)}
        onStatusChange={handleTalpaStatusChange}
      />
    </>
  );
};

export default InstalmentAccordionSections;
