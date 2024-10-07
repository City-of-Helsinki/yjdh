import Sidebar from 'benefit/handler/components/sidebar/Sidebar';
import { APPLICATION_LIST_TABS } from 'benefit/handler/constants';
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
import {
  focusAndScroll,
  focusAndScrollToSelector,
} from 'shared/utils/dom.utils';

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
  isApplicationReadOnly: boolean;
};

const HandlingApplicationActions: React.FC<Props> = ({
  application,
  stepperDispatch,
  stepState,
  'data-testid': dataTestId,
  isRecalculationRequired,
  isCalculationsErrors,
  isApplicationReadOnly,
}) => {
  const {
    t,
    toggleMessagesDrawerVisibility,
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

  const navigateToIndex = React.useCallback(
    (): void =>
      void router.push({
        pathname: '/',
        query: { tab: APPLICATION_LIST_TABS.HANDLING },
      }),
    [router]
  );

  const effectSaveAndClose = (): void => {
    if (
      data?.review_step === stepState.activeStepIndex + 1 &&
      isSavingAndClosing
    ) {
      setIsSavingAndClosing(false);
      navigateToIndex();
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
    navigateToIndex,
  ]);
  React.useEffect(() => {
    setIsSavingAndClosing(false);
  }, [isError]);

  const isCalculationInvalid = (): boolean =>
    (application.calculation.rows.length === 0 &&
      handledApplication?.status === APPLICATION_STATUSES.ACCEPTED) ||
    isRecalculationRequired ||
    isCalculationsErrors;

  const validateNextStep = (currentStepIndex: number): boolean => {
    if (application.status === APPLICATION_STATUSES.INFO_REQUIRED) {
      focusAndScroll('header-info-needed');
      showErrorToast(
        t('common:status.additional_information_needed'),
        t(`common:applications.statuses.additionalInformationNeeded`)
      );
      return true;
    }
    const fields = {
      missing: {
        status: !handledApplication?.status,
        calculation: isCalculationInvalid(),
        logEntry:
          handledApplication?.logEntryComment?.length <= 0 &&
          handledApplication?.status === APPLICATION_STATUSES.REJECTED,
        handler: false,
        // Use longer length to take HTML tags into account
        decisionText: handledApplication?.decisionText?.length <= 10,
        justificationText: handledApplication?.justificationText?.length <= 10,
      },
      id: {
        status: '#proccessRejectedRadio',
        calculation: '#endDate',
        logEntry: '#proccessRejectedRadio',
        handler: '#radio-decision-maker-handler',
        decisionText: '[data-testid="decisionText"]',
        justificationText: '[data-testid="justificationText"]',
      },
    };

    const errorStep1 =
      fields.missing.status ||
      fields.missing.calculation ||
      fields.missing.logEntry;

    let errorStep2 = false;
    if (currentStepIndex > 0) {
      fields.missing.handler = !['handler', 'manager'].includes(
        handledApplication?.handlerRole
      );

      errorStep2 =
        fields.missing.decisionText ||
        fields.missing.justificationText ||
        fields.missing.handler;
    }

    if (errorStep1 || errorStep2) {
      const missingFields = Object.keys(fields.missing).filter(
        (key) => fields.missing[key]
      );
      let interval = 0;
      missingFields.forEach((key, index) => {
        if (index === 0) {
          focusAndScrollToSelector(String(fields.id[key]));
        }
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
      // Final step, just open confirmation modal before submitting
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
    if (isCalculationInvalid()) {
      focusAndScroll('endDate');
      showErrorToast(
        t('common:review.decisionProposal.errors.title'),
        t(`common:review.decisionProposal.errors.fields.calculation`)
      );

      return;
    }
    updateApplication({
      ...handledApplication,
      reviewStep: stepState.activeStepIndex + 1,
      applicationId: application.id,
    });
    setIsSavingAndClosing(true);
  };

  const handleClose = (): void => navigateToIndex();

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
            disabled={isSavingAndClosing || isApplicationReadOnly}
            isLoading={isSavingAndClosing}
            theme="black"
            variant="secondary"
          >
            {t(`${translationsBase}.saveAndContinue`)}
          </Button>
        )}

        <Button
          onClick={toggleMessagesDrawerVisibility}
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
          !application.archived && (
            <Button
              onClick={openDialog}
              theme="black"
              disabled={isApplicationReadOnly}
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
            disabled={isApplicationReadOnly}
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
        onClose={toggleMessagesDrawerVisibility}
        customItemsMessages={[
          <EditAction application={application} key="edit" />,
        ]}
        customItemsNotes={[
          <$CustomNotesActions key="showToHandlerOnly">
            <IconLock />
            <p>{t('common:messenger.showToHandlerOnly')}</p>
          </$CustomNotesActions>,
        ]}
      />
    </$Wrapper>
  );
};

export default HandlingApplicationActions;
