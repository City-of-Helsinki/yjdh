import Sidebar from 'benefit/handler/components/sidebar/Sidebar';
import { Application as HandlerApplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
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
  'data-testid'?: string;
};

const HandlingApplicationActions: React.FC<Props> = ({
  application,
  'data-testid': dataTestId,
}) => {
  const {
    t,
    onDone,
    onDoneConfirmation,
    onBackToHandling,
    onSaveAndClose,
    toggleMessagesDrawerVisibility,
    openDialog,
    closeDialog,
    closeDoneDialog,
    handleCancel,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
    isConfirmationModalOpen,
    isDoneConfirmationModalOpen,
    handledApplication,
  } = useHandlingApplicationActions(application);

  const canBeOpenedForEdit =
    application.status &&
    [
      APPLICATION_STATUSES.HANDLING,
      APPLICATION_STATUSES.INFO_REQUIRED,
    ].includes(application.status);

  return (
    <$Wrapper data-testid={dataTestId}>
      <$Column>
        {application.status === APPLICATION_STATUSES.HANDLING && (
          <Button
            onClick={onDoneConfirmation}
            theme={ButtonPresetTheme.Coat}
            disabled={isDisabledDoneButton}
          >
            {t(`${translationsBase}.done`)}
          </Button>
        )}
        {application.status === APPLICATION_STATUSES.HANDLING ? (
          <Button
            onClick={onSaveAndClose}
            theme={ButtonPresetTheme.Black}
            variant={ButtonVariant.Secondary}
          >
            {t(`${translationsBase}.saveAndContinue`)}
          </Button>
        ) : (
          <Button
            onClick={onSaveAndClose}
            theme={ButtonPresetTheme.Black}
            variant={ButtonVariant.Secondary}
          >
            {t(`${translationsBase}.close`)}
          </Button>
        )}
        {application.status &&
          [
            APPLICATION_STATUSES.ACCEPTED,
            APPLICATION_STATUSES.REJECTED,
          ].includes(application.status) &&
          !application.batch &&
          !application.archived && (
            <Button
              onClick={onBackToHandling}
              theme={ButtonPresetTheme.Black}
              variant={ButtonVariant.Secondary}
              iconStart={<IconArrowUndo />}
            >
              {t(`${translationsBase}.backToHandling`)}
            </Button>
          )}
        <Button
          onClick={toggleMessagesDrawerVisibility}
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          iconStart={<IconPen />}
        >
          {t(`${translationsBase}.handlingPanel`)}
        </Button>
      </$Column>
      {application.status !== APPLICATION_STATUSES.CANCELLED &&
        !application.batch &&
        !application.archived && (
          <$Column>
            <Button
              onClick={openDialog}
              theme={ButtonPresetTheme.Black}
              variant={ButtonVariant.Supplementary}
              iconStart={<IconTrash />}
            >
              {t(`${translationsBase}.cancel`)}
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
              onSubmit={onDone}
              calculationRows={application.calculation?.rows || []}
            />
          }
        />
      )}
      <Sidebar
        isOpen={isMessagesDrawerVisible}
        application={application as HandlerApplication}
        onClose={toggleMessagesDrawerVisibility}
        customItemsMessages={[
          canBeOpenedForEdit ? (
            <EditAction application={application} key="edit" />
          ) : null,
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
