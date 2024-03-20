import Sidebar from 'benefit/handler/components/sidebar/Sidebar';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import {
  Button,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUndo,
  IconInfoCircle,
  IconLock,
  IconPen,
  IconTrash,
} from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';

import useApplicationDecisionProposalMutation from '../../useApplicationDecisionProposalQuery';
import { StepActionType, StepStateType } from '../../useApplicationStepper';
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
    onDone,
    onBackToHandling,
    onSaveAndClose,
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
  } = useHandlingApplicationActions(application);

  const lastStep =
    stepState.activeStepIndex === Number(stepState.steps?.length) - 1;

  const { data, mutate: updateApplication } =
    useApplicationDecisionProposalMutation(application);

  React.useEffect(() => {
    if (data?.review_step) {
      stepperDispatch({
        type: 'completeStep',
        payload: data.review_step - 2,
      });
    }
  }, [data, stepperDispatch]);

  const handleNext = (): void => {
    updateApplication({
      ...handledApplication,
      reviewStep: Math.min(stepState.activeStepIndex + 2, 4),
      applicationId: application.id,
    });
  };

  const disableStepButton = (activeStepIndex: number): boolean => {
    const step1 =
      !handledApplication?.status ||
      application.calculation.rows.length === 0 ||
      isRecalculationRequired ||
      isCalculationsErrors;

    const step2 =
      activeStepIndex === 0
        ? false
        : handledApplication?.decisionText?.length <= 0 ||
          handledApplication?.justificationText?.length <= 0 ||
          !['handler', 'manager'].includes(handledApplication.handlerRole);

    return step1 || step2;
  };

  const handlePrev = (): void => {
    updateApplication({
      ...handledApplication,
      reviewStep: Math.max(0, stepState.activeStepIndex),
      applicationId: application.id,
    });
  };

  return (
    <$Wrapper data-testid={dataTestId}>
      <$Column>
        <Button onClick={onSaveAndClose} theme="black" variant="secondary">
          {t(`${translationsBase}.close`)}
        </Button>
        {[
          APPLICATION_STATUSES.ACCEPTED,
          APPLICATION_STATUSES.REJECTED,
        ].includes(application.status) &&
          !application.batch &&
          !application.archived && (
            <Button
              onClick={onBackToHandling}
              theme="black"
              variant="secondary"
              iconLeft={<IconArrowUndo />}
            >
              {t(`${translationsBase}.backToHandling`)}
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

        {application.status !== APPLICATION_STATUSES.CANCELLED &&
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
      <$Column>
        <Button
          theme="coat"
          variant="primary"
          style={{ minWidth: '158px' }}
          disabled={disableStepButton(stepState.activeStepIndex)}
          onClick={handleNext}
          iconRight={lastStep ? undefined : <IconArrowRight />}
        >
          {lastStep ? t('common:utility.send') : t('common:utility.next')}
        </Button>

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
              <CancelModalContent
                onClose={closeDialog}
                onSubmit={handleCancel}
              />
            }
          />
        )}
      </$Column>
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
              onSubmit={onDone}
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
