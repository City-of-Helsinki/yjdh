import PaginatedApplicationList from 'benefit/applicant/components/applications/applicationList/PaginatedApplicationList';
import {
  $ButtonContainer,
  $NoDecisionsText,
} from 'benefit/applicant/components/decisions/DecisionsApplicationList.sc';
import { ROUTES, SUBMITTED_STATUSES } from 'benefit/applicant/constants';
import ApplicationListContext from 'benefit/applicant/context/ApplicationListContext';
import { Trans, useTranslation } from 'benefit/applicant/i18n';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { isTruthy } from 'benefit-shared/utils/common';
import { Button, IconArrowLeft, Notification } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import { useTheme } from 'styled-components';

const DecisionsApplicationList = (): JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  return (
    <PaginatedApplicationList
      heading={
        <ApplicationListContext.Consumer>
          {({ count }) => (
            <Trans
              i18nKey="common:decisions.heading"
              values={{ count }}
              components={{
                strong: <strong />,
              }}
            />
          )}
        </ApplicationListContext.Consumer>
      }
      status={SUBMITTED_STATUSES}
      isArchived
      orderByOptions={[
        {
          label: t('common:sortOrder.submittedAt.desc'),
          value: '-submitted_at',
        },
        { label: t('common:sortOrder.submittedAt.asc'), value: 'submitted_at' },
        { label: t('common:sortOrder.name.asc'), value: 'employee_name' },
      ]}
      beforeList={
        <ApplicationListContext.Consumer>
          {({ list }) => {
            if (!isTruthy(process.env.NEXT_PUBLIC_ENABLE_ALTERATION_FEATURES)) {
              return null;
            }

            if (
              !list.some(
                (item) => item.status === APPLICATION_STATUSES.ACCEPTED
              )
            ) {
              return null;
            }

            return (
              <Notification
                label={t('common:applications.list.alterationReminder.label')}
                type="info"
                style={{ marginBottom: theme.spacing.m }}
              >
                {t('common:applications.list.alterationReminder.body')}
              </Notification>
            );
          }}
        </ApplicationListContext.Consumer>
      }
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
