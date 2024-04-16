import Sidebar from 'benefit/handler/components/sidebar/Sidebar';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import {
  Button,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  IconLock,
  IconPen,
  IconTrash,
} from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import * as React from 'react';
import Modal from 'shared/components/modal/Modal';
import showErrorToast from 'shared/components/toast/show-error-toast';
import theme from 'shared/styles/theme';
import { focusAndScroll } from 'shared/utils/dom.utils';

import useDecisionProposalDraftMutation from '../../../../hooks/applicationHandling/useDecisionProposalDraftMutation';
import {
  StepActionType,
  StepStateType,
} from '../../../../hooks/applicationHandling/useHandlingStepper';
import EditAction from '../editAction/EditAction';
import CancelModalContent from './CancelModalContent/CancelModalContent';
import DoneModalContent from './DoneModalContent/DoneModalContent';
import {
  $Column,
  $CustomNotesActions,
  $Wrapper,
} from './HandlingApplicationActions.sc';
import { useHandlingApplicationActions } from './useHandlingApplicationActions';

export type Props = {
  application: Application;
  stepperDispatch: React.Dispatch<StepActionType>;
  stepState: StepStateType;
  'data-testid'?: string;
  isRecalculationRequired: boolean;
  isCalculationsErrors: boolean;
};

const HandlingApplicationActions: React.FC<Props> = ({
  application,
  stepperDispatch,
  stepState,
  'data-testid': dataTestId,
  isRecalculationRequired,
  isCalculationsErrors,
}) => {
  const {
    t,
    toggleMessagesDrawerVisiblity,
    openDialog,
    closeDialog,
    closeDoneDialog,
    handleCancel,
    isMessagesDrawerVisible,
    translationsBase,
    isConfirmationModalOpen,
    isDoneConfirmationModalOpen,
    handledApplication,
    onDoneConfirmation,
  } = useHandlingApplicationActions(application);

  const lastStep =
    stepState.activeStepIndex === Number(stepState.steps?.length) - 1;
  const router = useRouter();
  const {
    data,
    mutate: updateApplication,
    isError,
  } = useDecisionProposalDraftMutation(application);

  const [isSavingAndClosing, setIsSavingAndClosing] = React.useState(false);

  const effectSaveAndClose = (): void => {
    if (
      data?.review_step === stepState.activeStepIndex + 1 &&
      isSavingAndClosing
    ) {
      setIsSavingAndClosing(false);
      void router.push('/');
    }
  };

  const effectReviewStepChange = (): void => {
    if (data?.review_step) {
      stepperDispatch({
        type: 'completeStep',
        payload: data.review_step - 2,
      });
    }
  };

  const effectApplicationStatusChange = (): void => {
    if (
      [APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED].includes(
        application.status
      ) &&
      stepState.activeStepIndex === 2
    ) {
      router.query.action = 'submit';
      void router.push(router);
    }
  };

  React.useEffect(effectApplicationStatusChange, [
    application.status,
    router,
    stepState.activeStepIndex,
  ]);
  React.useEffect(effectReviewStepChange, [data, stepperDispatch]);
  React.useEffect(effectSaveAndClose, [
    data,
    router,
    stepState.activeStepIndex,
    isSavingAndClosing,
  ]);
  React.useEffect(() => {
    setIsSavingAndClosing(false);
  }, [isError]);

  const validateNextStep = (currentStepIndex: number): boolean => {
    if (application.status === APPLICATION_STATUSES.INFO_REQUIRED) {
      focusAndScroll('header-info-needed');
      showErrorToast(
        t('common:status.additional_information_needed'),
        t(`common:applications.statuses.additionalInformationNeeded`)
      );
      return true;
    }
    const missing = {
      status: !handledApplication?.status,
      calculation:
        (application.calculation.rows.length === 0 &&
          handledApplication?.status === APPLICATION_STATUSES.ACCEPTED) ||
        isRecalculationRequired ||
        isCalculationsErrors,
      logEntry:
        handledApplication?.logEntryComment?.length <= 0 &&
        handledApplication?.status === APPLICATION_STATUSES.REJECTED,
      handler: false,
      // Use longer length to take HTML tags into account
      decisionText: handledApplication?.decisionText?.length <= 10,
      justificationText: handledApplication?.justificationText?.length <= 10,
    };

    const errorStep1 =
      missing.status || missing.calculation || missing.logEntry;

    let errorStep2 = false;
    if (currentStepIndex > 0) {
      missing.handler = !['handler', 'manager'].includes(
        handledApplication?.handlerRole
      );

      errorStep2 =
        missing.decisionText || missing.justificationText || missing.handler;
    }

    if (errorStep1 || errorStep2) {
      const missingFields = Object.keys(missing).filter((key) => missing[key]);
      let interval = 0;
      missingFields.forEach((key) => {
        setTimeout(() => {
          showErrorToast(
            t('common:review.decisionProposal.errors.title'),
            t(`common:review.decisionProposal.errors.fields.${key}`)
          );
        }, interval);
        interval += 200;
      });
    }

    return errorStep1 || errorStep2;
  };

  const handleNext = (finishProposal = false): void => {
    if (finishProposal || stepState.activeStepIndex < 2) {
      updateApplication({
        ...handledApplication,
        reviewStep: Math.min(stepState.activeStepIndex + 2, 4),
        applicationId: application.id,
      });
    } else {
      // Final step, just open confirmation modal
      onDoneConfirmation();
    }
  };

  const handlePrev = (): void => {
    updateApplication({
      ...handledApplication,
      reviewStep: Math.max(0, stepState.activeStepIndex),
      applicationId: application.id,
    });
  };

  const handleSaveAndClose = (): void => {
    updateApplication({
      ...handledApplication,
      reviewStep: stepState.activeStepIndex + 1,
      applicationId: application.id,
    });
    setIsSavingAndClosing(true);
  };

  const handleClose = (): void => void router.push('/');

  return (
    <$Wrapper data-testid={dataTestId}>
      <$Column>
        <Button onClick={handleClose} theme="black" variant="secondary">
          {t(`${translationsBase}.close`)}
        </Button>
        {application.status === APPLICATION_STATUSES.HANDLING && (
          <Button
            loadingText={t('common:utility.loading')}
            onClick={handleSaveAndClose}
            disabled={isSavingAndClosing}
            isLoading={isSavingAndClosing}
            theme="black"
            variant="secondary"
          >
            {t(`${translationsBase}.saveAndContinue`)}
          </Button>
        )}

        <Button
          onClick={toggleMessagesDrawerVisiblity}
          theme="black"
          variant="secondary"
          iconLeft={<IconPen />}
        >
          {t(`${translationsBase}.handlingPanel`)}
        </Button>

        {![
          APPLICATION_STATUSES.CANCELLED,
          APPLICATION_STATUSES.ACCEPTED,
          APPLICATION_STATUSES.REJECTED,
        ].includes(application.status) &&
          !application.batch &&
          !application.archived && (
            <Button
              onClick={openDialog}
              theme="black"
              variant="supplementary"
              iconLeft={<IconTrash />}
            >
              {t(`${translationsBase}.cancel`)}
            </Button>
          )}
      </$Column>

      {application?.status === APPLICATION_STATUSES.HANDLING && (
        <$Column>
          {stepState.activeStepIndex !== 0 && (
            <Button
              variant="secondary"
              theme="black"
              iconLeft={<IconArrowLeft />}
              onClick={() => handlePrev()}
            >
              {t('common:utility.previous')}
            </Button>
          )}
          <Button
            theme="coat"
            variant="primary"
            style={{ minWidth: '158px' }}
            onClick={() =>
              !validateNextStep(stepState.activeStepIndex) ? handleNext() : null
            }
            iconRight={lastStep ? undefined : <IconArrowRight />}
          >
            {lastStep ? t('common:utility.send') : t('common:utility.next')}
          </Button>
        </$Column>
      )}

      {isConfirmationModalOpen && (
        <Modal
          id="Handler-confirmDeleteApplicationModal"
          isOpen={isConfirmationModalOpen}
          title={t(`${translationsBase}.reasonCancelDialogTitle`)}
          submitButtonLabel=""
          cancelButtonLabel={t('common:applications.actions.close')}
          handleToggle={closeDialog}
          handleSubmit={noop}
          headerIcon={<IconInfoCircle />}
          submitButtonIcon={<IconTrash />}
          variant="danger"
          customContent={
            <CancelModalContent onClose={closeDialog} onSubmit={handleCancel} />
          }
        />
      )}
      {isDoneConfirmationModalOpen && (
        <Modal
          id="Handler-confirmDecisionApplicationModal"
          isOpen={isDoneConfirmationModalOpen}
          title={t(`${translationsBase}.confirm`)}
          submitButtonLabel=""
          cancelButtonLabel={t('common:applications.actions.close')}
          handleToggle={closeDoneDialog}
          handleSubmit={noop}
          headerIcon={<IconInfoCircle />}
          className=""
          variant="primary"
          theme={theme.components.modal.coat}
          customContent={
            <DoneModalContent
              handledApplication={handledApplication}
              onClose={closeDoneDialog}
              onSubmit={() => handleNext(true)}
              calculationRows={application.calculation?.rows}
            />
          }
        />
      )}
      <Sidebar
        application={application}
        isOpen={isMessagesDrawerVisible}
        isReadOnly={
          application.status && HANDLED_STATUSES.includes(application.status)
        }
        onClose={toggleMessagesDrawerVisiblity}
        customItemsMessages={<EditAction application={application} />}
        customItemsNotes={
          <$CustomNotesActions>
            <IconLock />
            <p>{t('common:messenger.showToHanlderOnly')}</p>
          </$CustomNotesActions>
        }
      />
    </$Wrapper>
  );
};

export default HandlingApplicationActions;
