import {
  $AlterationActionContainer,
  $AlterationListCount,
  $DecisionActionContainer,
  $DecisionBox,
  $DecisionBoxTitle,
  $DecisionDetails,
  $DecisionNumber,
  $Subheading,
} from 'benefit-shared/components/decisionSummary/DecisionSummary.sc';
import { AlterationAccordionItemProps, Application, DecisionDetailList } from 'benefit-shared/types/application';
import { isTruthy } from 'benefit-shared/utils/common';
import { Button, IconLinkExternal } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { ReactNode } from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

type Props = {
  application: Application;
  actions: ReactNode;
  itemComponent: React.ComponentType<AlterationAccordionItemProps>;
  detailList: DecisionDetailList;
  extraInformation?: ReactNode;
};

const DecisionSummary = ({ application, actions, itemComponent: ItemComponent, detailList, extraInformation }: Props): JSX.Element => {
  const { t } = useTranslation();

  if (!application.ahjoCaseId) {
    return null;
  }

  const displayDecision = (): void => {
    const id = application.ahjoCaseId.split(' ').join('-');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    window.open(`https://paatokset.hel.fi/fi/asia/${id}`, '_blank');
  };

  const sortedAlterations = application.alterations?.sort(
    (a, b) => Date.parse(a.endDate) - Date.parse(b.endDate)
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
        {detailList.map((detail) => <div key={detail.key}>
          <dt>{t(`common:applications.decision.headings.${detail.key}`)}</dt>
          <dd>
            {detail.accessor(application) || '-'}
          </dd>
        </div>)}
      </$DecisionDetails>
      {extraInformation}
      <$DecisionActionContainer>
        <Button
          iconRight={<IconLinkExternal />}
          onClick={displayDecision}
          theme="black"
          variant="secondary"
          role="link"
        >
          {t('common:applications.decision.actions.showDecision')}
        </Button>
      </$DecisionActionContainer>
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
          {sortedAlterations.map((alteration) => (
            <ItemComponent
              key={alteration.id}
              alteration={alteration}
              application={application}
            />
          ))}
          <$AlterationActionContainer>
            {actions}
          </$AlterationActionContainer>
        </>
      )}
    </$DecisionBox>
  );
};

export default DecisionSummary;
