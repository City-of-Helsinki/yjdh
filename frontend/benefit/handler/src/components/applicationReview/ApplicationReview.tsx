import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { StepStateType } from 'benefit/handler/hooks/useSteps';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ErrorData } from 'benefit-shared/types/common';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import ErrorPage from 'shared/components/pages/ErrorPage';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';

import { useApplicationStepper } from '../../hooks/applicationHandling/useHandlingStepper';
import HandlingApplicationActions from './actions/handlingApplicationActions/HandlingApplicationActions';
import HandlingApplicationActionsAhjo from './actions/handlingApplicationActions/HandlingApplicationActionsAhjo';
import ReceivedApplicationActions from './actions/receivedApplicationActions/ReceivedApplicationActions';
import {
  $ApplicationReview,
  $ApplicationReviewLocked,
} from './ApplicationReview.sc';
import ApplicationReviewLoading from './ApplicationReviewLoading';
import ApplicationReviewStep1 from './handlingView/HandlingStep1';
import ApplicationReviewStep2 from './handlingView/HandlingStep2';
import ApplicationReviewStep3 from './handlingView/HandlingStep3';
import ApplicationStepper from './handlingView/HandlingStepper';
import NotificationView from './notificationView/NotificationView';
import { useApplicationReview } from './useApplicationReview';

const renderStepper = (
  isNewAhjoMode,
  stepState: StepStateType,
  status: APPLICATION_STATUSES
): JSX.Element =>
  isNewAhjoMode &&
  [APPLICATION_STATUSES.HANDLING, APPLICATION_STATUSES.INFO_REQUIRED].includes(
    status
  ) ? (
    <ApplicationStepper stepState={stepState} />
  ) : null;

const ApplicationReview: React.FC = () => {
  const { application, isLoading, t, isApplicationReadOnly } =
    useApplicationReview();

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
    return <ApplicationReviewLoading />;
  }

  if (router.query?.action === 'submit') {
    return <NotificationView data={application} />;
  }

  if (!application?.id) {
    return (
      <ErrorPage
        title={t('common:error.notFound.title')}
        message={t('common:error.notFound.text')}
      />
    );
  }

  const showNewAhjoActions =
    isNewAhjoMode &&
    (application.status === APPLICATION_STATUSES.HANDLING ||
      application.status === APPLICATION_STATUSES.ACCEPTED ||
      application.status === APPLICATION_STATUSES.REJECTED ||
      application.status === APPLICATION_STATUSES.INFO_REQUIRED);

  const showOldActions =
    !isNewAhjoMode &&
    (application.status === APPLICATION_STATUSES.HANDLING ||
      application.status === APPLICATION_STATUSES.INFO_REQUIRED ||
      HANDLED_STATUSES.includes(application.status));

  return (
    <>
      <ApplicationHeader
        data={application}
        isApplicationReadOnly={isApplicationReadOnly}
        data-testid="application-header"
      />
      <$ApplicationReview>
        {renderStepper(isNewAhjoMode, stepState, application?.status)}
        {isApplicationReadOnly && <$ApplicationReviewLocked />}

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
      </$ApplicationReview>

      <StickyActionBar>
        {application.status === APPLICATION_STATUSES.RECEIVED && (
          <ReceivedApplicationActions
            application={application}
            data-testid="received-application-actions"
          />
        )}

        {showOldActions && (
          <HandlingApplicationActions
            application={application}
            data-testid="handling-application-actions"
          />
        )}

        {showNewAhjoActions && (
          <HandlingApplicationActionsAhjo
            application={application}
            stepperDispatch={stepperDispatch}
            stepState={stepState}
            isApplicationReadOnly={isApplicationReadOnly}
            data-testid="handling-application-actions"
            isRecalculationRequired={isRecalculationRequired}
            isCalculationsErrors={!!calculationsErrors}
          />
        )}
      </StickyActionBar>
      <$StickyBarSpacing />
    </>
  );
};

export default ApplicationReview;
