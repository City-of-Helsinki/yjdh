import AlterationFormContainer from 'benefit/handler/components/alteration/AlterationFormContainer';
import { $Heading } from 'benefit/handler/components/alterationList/AlterationList.sc';
import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import useAlterationPage from 'benefit/handler/components/applications/alteration/useAlterationPage';
import { ROUTES } from 'benefit/handler/constants';
import {
  ALTERATION_STATE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { Button } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import Container from 'shared/components/container/Container';
import ErrorPage from 'shared/components/pages/ErrorPage';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

const NewAlteration: React.FC = () => {
  const { application, isLoading, isError, t, id } = useAlterationPage();
  const router = useRouter();

  if (isLoading || (!isError && !application)) {
    return <PageLoadingSpinner />;
  }

  if (isError || !id) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
      />
    );
  }

  const hasPendingAlteration = application.alterations.some(
    (alteration) => alteration.state === ALTERATION_STATE.RECEIVED
  );

  const isAccepted = application.status === APPLICATION_STATUSES.ACCEPTED;

  const canCreate = !hasPendingAlteration && isAccepted;

  const returnToApplication = (): void =>
    void router.push(`${ROUTES.APPLICATION}?id=${application.id}`);

  return (
    <div>
      <ApplicationHeader
        data={application}
        isApplicationReadOnly={false}
        data-testid="application-header"
      />
      {canCreate ? (
        <AlterationFormContainer
          application={application}
          onCancel={returnToApplication}
          onSuccess={returnToApplication}
        />
      ) : (
        <Container>
          <$Heading>{t('common:applications.alterations.new.title')}</$Heading>
          {hasPendingAlteration && (
            <p>
              {t('common:applications.alterations.new.error.pendingAlteration')}
            </p>
          )}
          {!isAccepted && (
            <p>
              {t('common:applications.alterations.new.error.notYetAccepted')}
            </p>
          )}
          <Button theme="coat" onClick={returnToApplication}>
            {t(
              `common:applications.alterations.new.actions.returnToApplication`
            )}
          </Button>
        </Container>
      )}
    </div>
  );
};

export default NewAlteration;
