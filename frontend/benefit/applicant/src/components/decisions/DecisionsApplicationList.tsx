import ApplicationsList from 'benefit/applicant/components/applications/applicationList/ApplicationList';
import {
  $ButtonContainer,
  $NoDecisionsText,
} from 'benefit/applicant/components/decisions/DecisionsApplicationList.sc';
import { ROUTES, SUBMITTED_STATUSES } from 'benefit/applicant/constants';
import { Trans, useTranslation } from 'benefit/applicant/i18n';
import { Button, IconArrowLeft } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';

const DecisionsApplicationList = (): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ApplicationsList
      heading={(count) => (
        <Trans
          i18nKey="common:decisions.heading"
          values={{ count }}
          components={{
            strong: <strong />,
          }}
        />
      )}
      status={SUBMITTED_STATUSES}
      isArchived
      clientPaginated
      orderByOptions={[
        {
          label: t('common:sortOrder.submittedAt.desc'),
          value: '-submitted_at',
        },
        { label: t('common:sortOrder.submittedAt.asc'), value: 'submitted_at' },
        { label: t('common:sortOrder.name.asc'), value: 'employee_name' },
      ]}
      noItemsText={
        <div>
          <$NoDecisionsText>
            {t('common:decisions.noDecisions')}
          </$NoDecisionsText>
          <$ButtonContainer>
            <Button
              variant="secondary"
              onClick={() => router.push(ROUTES.HOME)}
              theme="black"
              iconLeft={<IconArrowLeft />}
            >
              {t('common:utility.back')}
            </Button>
          </$ButtonContainer>
        </div>
      }
    />
  );
};

export default DecisionsApplicationList;
