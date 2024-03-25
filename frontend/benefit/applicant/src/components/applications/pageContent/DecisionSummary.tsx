import {
  $ActionContainer,
  $AlterationListCount,
  $DecisionBox,
  $DecisionBoxTitle,
  $DecisionDetails,
  $DecisionNumber,
  $Subheading,
} from 'benefit/applicant/components/applications/pageContent/PageContent.sc';
import StatusIcon from 'benefit/applicant/components/applications/StatusIcon';
import { ROUTES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  ALTERATION_STATE,
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { isTruthy } from 'benefit-shared/utils/common';
import { Button, IconLinkExternal } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

type Props = {
  application: Application;
};

const DecisionSummary = ({ application }: Props): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();

  if (!application.ahjoCaseId) {
    return null;
  }

  const displayDecision = (): void => {
    const id = application.ahjoCaseId.split(' ').join('-');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(`https://paatokset.hel.fi/fi/asia/${id}`, '_blank');
  };

  const hasHandledTermination = application.alterations.some(
    (alteration) =>
      alteration.state === ALTERATION_STATE.HANDLED &&
      alteration.alterationType === ALTERATION_TYPE.TERMINATION
  );

  return (
    <$DecisionBox>
      <$DecisionBoxTitle>
        {t('common:applications.decision.headings.mainHeading')}
      </$DecisionBoxTitle>
      <$DecisionNumber>
        {t('common:applications.decision.headings.caseId')}
        {': '}
        {application.ahjoCaseId}
      </$DecisionNumber>
      <$Subheading>
        {t(`common:applications.decision.description.${application.status}`, {
          dateRangeStart: convertToUIDateFormat(application.startDate),
          dateRangeEnd: convertToUIDateFormat(application.endDate),
        })}
      </$Subheading>
      <$DecisionDetails>
        <div>
          <dt>{t('common:applications.decision.headings.status')}</dt>
          <dd>
            <StatusIcon status={application.status} />
            {t(`common:applications.statuses.${application.status}`)}
          </dd>
        </div>
        <div>
          <dt>{t('common:applications.decision.headings.benefitAmount')}</dt>
          <dd>{formatFloatToCurrency(application.calculatedBenefitAmount)}</dd>
        </div>
        <div>
          <dt>{t('common:applications.decision.headings.benefitPeriod')}</dt>
          <dd>
            {`${convertToUIDateFormat(
              application.startDate
            )} – ${convertToUIDateFormat(application.endDate)}`}
          </dd>
        </div>
        <div>
          <dt>{t('common:applications.decision.headings.decisionDate')}</dt>
          <dd>{convertToUIDateFormat(application.ahjoDecisionDate)}</dd>
        </div>
      </$DecisionDetails>
      <$ActionContainer>
        <Button
          iconRight={<IconLinkExternal />}
          onClick={displayDecision}
          theme="black"
          variant="secondary"
          role="link"
        >
          {t('common:applications.decision.actions.showDecision')}
        </Button>
      </$ActionContainer>
      {isTruthy(process.env.NEXT_PUBLIC_ENABLE_ALTERATION_FEATURES) && (
        <>
          <$Subheading>
            {t('common:applications.decision.headings.existingAlterations')}
          </$Subheading>
          <$AlterationListCount>
            {application.alterations?.length > 0
              ? t('common:applications.decision.alterationList.count', {
                  count: application.alterations.length,
                })
              : t('common:applications.decision.alterationList.empty')}
          </$AlterationListCount>
          <$ActionContainer>
            {application.status === APPLICATION_STATUSES.ACCEPTED &&
              !hasHandledTermination && (
                <Button
                  theme="coat"
                  onClick={() =>
                    router.push(
                      `${ROUTES.APPLICATION_ALTERATION}?id=${application.id}`
                    )
                  }
                >
                  {t('common:applications.decision.actions.reportAlteration')}
                </Button>
              )}
          </$ActionContainer>
        </>
      )}
    </$DecisionBox>
  );
};

export default DecisionSummary;
