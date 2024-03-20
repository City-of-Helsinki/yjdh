import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ErrorData } from 'benefit-shared/types/common';
import { LoadingSpinner } from 'hds-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';

import HandlingApplicationActions from './actions/handlingApplicationActions/HandlingApplicationActions';
import HandlingApplicationActionsAhjo from './actions/handlingApplicationActions/HandlingApplicationActionsAhjo';
import ReceivedApplicationActions from './actions/receivedApplicationActions/ReceivedApplicationActions';
import { $ApplicationReview } from './ApplicationReview.sc';
import ApplicationReviewStep1 from './ApplicationReviewStep1';
import ApplicationReviewStep2 from './ApplicationReviewStep2';
import ApplicationReviewStep3 from './ApplicationReviewStep3';
import ApplicationStepper from './ApplicationStepper';
import NotificationView from './notificationView/NotificationView';
import { useApplicationReview } from './useApplicationReview';
import { useApplicationStepper } from './useApplicationStepper';

const ApplicationReview: React.FC = () => {
  const { application, isLoading, t } = useApplicationReview();

  const isNewAhjoMode = useDetermineAhjoMode();

  const { stepState, stepperDispatch } = useApplicationStepper(
    application?.id ?? '',
    t,
    useQueryClient()
  );

  const [isRecalculationRequired, setIsRecalculationRequired] =
    React.useState<boolean>(false);
  const [calculationsErrors, setCalculationErrors] = React.useState<
    ErrorData | undefined | null
  >();

  const router = useRouter();

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (router.query.submitted === '1') {
    return <NotificationView data={application} />;
  }

  return (
    <$ApplicationReview>
      <ApplicationHeader data={application} data-testid="application-header" />

      {isNewAhjoMode &&
        [
          APPLICATION_STATUSES.HANDLING,
          APPLICATION_STATUSES.INFO_REQUIRED,
        ].includes(application.status) && (
          <ApplicationStepper stepState={stepState} />
        )}

      {stepState.activeStepIndex === 0 && (
        <ApplicationReviewStep1
          application={application}
          setIsRecalculationRequired={setIsRecalculationRequired}
          setCalculationErrors={setCalculationErrors}
          calculationsErrors={calculationsErrors}
          isRecalculationRequired={isRecalculationRequired}
        />
      )}

      {stepState.activeStepIndex === 1 && (
        <ApplicationReviewStep2 application={application} />
      )}
      {stepState.activeStepIndex === 2 && (
        <ApplicationReviewStep3 application={application} />
      )}

      <StickyActionBar>
        {application.status === APPLICATION_STATUSES.RECEIVED && (
          <ReceivedApplicationActions
            application={application}
            data-testid="received-application-actions"
          />
        )}

        {!isNewAhjoMode &&
          (application.status === APPLICATION_STATUSES.HANDLING ||
            application.status === APPLICATION_STATUSES.INFO_REQUIRED ||
            HANDLED_STATUSES.includes(application.status)) && (
            <HandlingApplicationActions
              application={application}
              data-testid="handling-application-actions"
            />
          )}

        {isNewAhjoMode &&
          (application.status === APPLICATION_STATUSES.HANDLING ||
            application.status === APPLICATION_STATUSES.INFO_REQUIRED) && (
            <HandlingApplicationActionsAhjo
              application={application}
              stepperDispatch={stepperDispatch}
              stepState={stepState}
              data-testid="handling-application-actions"
              isRecalculationRequired={isRecalculationRequired}
              isCalculationsErrors={!!calculationsErrors}
            />
          )}
      </StickyActionBar>
      <$StickyBarSpacing />
    </$ApplicationReview>
  );
};

export default ApplicationReview;
