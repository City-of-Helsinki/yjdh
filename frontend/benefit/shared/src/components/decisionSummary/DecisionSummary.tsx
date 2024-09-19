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
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  AlterationAccordionItemProps,
  Application,
  DecisionDetailList,
} from 'benefit-shared/types/application';
import { Button, IconLinkExternal } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { ReactNode } from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

type Props = {
  application: Application;
  actions: ReactNode;
  itemComponent?: React.ComponentType<AlterationAccordionItemProps>;
  detailList: DecisionDetailList;
  extraInformation?: ReactNode;
};

const DecisionSummary = ({
  application,
  actions,
  itemComponent: ItemComponent,
  detailList,
  extraInformation,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const isNotRejected = ![
    APPLICATION_STATUSES.REJECTED,
    APPLICATION_STATUSES.CANCELLED,
  ].includes(application.status);

  if (
    isNotRejected &&
    application?.handledByAhjoAutomation &&
    !application?.ahjoCaseId
  ) {
    return null;
  }

  const openDecisionLink = (): void => {
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
      {isNotRejected && application.handledByAhjoAutomation && (
        <$DecisionNumber>
          {t('common:applications.decision.headings.caseId')}
          {': '}
          {application.ahjoCaseId}
        </$DecisionNumber>
      )}
      <$Subheading>
        {t(`common:applications.decision.description.${application.status}`, {
          dateRangeStart: convertToUIDateFormat(application.startDate),
          dateRangeEnd: convertToUIDateFormat(application.endDate),
        })}
      </$Subheading>
      <$DecisionDetails as="dl">
        {detailList.map((detail) => {
          if (detail.showIf && !detail.showIf(application)) {
            return null;
          }

          if (detail.invisible) {
            return <$GridCell $colSpan={detail.width || 3} key={detail.key} />;
          }

          return (
            <$GridCell $colSpan={detail.width || 3} key={detail.key}>
              <dt>
                {t(`common:applications.decision.headings.${detail.key}`)}
              </dt>
              <dd>{detail.accessor(application) || '-'}</dd>
            </$GridCell>
          );
        })}
      </$DecisionDetails>
      {extraInformation}
      {isNotRejected && application.handledByAhjoAutomation && (
        <$DecisionActionContainer>
          <Button
            iconRight={<IconLinkExternal />}
            onClick={openDecisionLink}
            theme="black"
            variant="secondary"
            role="link"
          >
            {t('common:applications.decision.actions.showDecision')}
          </Button>
        </$DecisionActionContainer>
      )}
      {isNotRejected && (
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
          <div data-testid="alteration-list">
            {sortedAlterations.map((alteration) => (
              <ItemComponent
                key={alteration.id}
                alteration={alteration}
                application={application}
              />
            ))}
          </div>
          <$AlterationActionContainer>{actions}</$AlterationActionContainer>
        </>
      )}
    </$DecisionBox>
  );
};

export default DecisionSummary;
