import 'react-loading-skeleton/dist/skeleton.css';

import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ErrorData } from 'benefit-shared/types/common';
import { useRouter } from 'next/router';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';
import theme from 'shared/styles/theme';

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
      <>
        <LoadingSkeleton
          width="100%"
          height={96}
          baseColor={theme.colors.coatOfArms}
          highlightColor={theme.colors.fogDark}
          borderRadius={0}
        />

        <Container>
          <$Grid>
            <$GridCell $colSpan={12}>
              <LoadingSkeleton width="100%" height={260} />
            </$GridCell>
            <$GridCell $colSpan={12}>
              <LoadingSkeleton width="100%" height={240} />
            </$GridCell>
            <$GridCell $colSpan={12}>
              <LoadingSkeleton width="100%" height={330} />
            </$GridCell>
            <$GridCell $colSpan={12}>
              <LoadingSkeleton width="100%" height={260} />
            </$GridCell>
          </$Grid>
        </Container>
      </>
    );
  }

  if (router.query?.action === 'submit') {
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

        {isNewAhjoMode && (
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
