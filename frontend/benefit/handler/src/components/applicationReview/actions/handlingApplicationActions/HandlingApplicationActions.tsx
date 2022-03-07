import Messenger from 'benefit/handler/components/messenger/Messenger';
import {
  APPLICATION_STATUSES,
  HANDLED_STATUSES,
} from 'benefit/handler/constants';
import { Application } from 'benefit/handler/types/application';
import {
  Button,
  IconArrowUndo,
  IconInfoCircle,
  IconLock,
  IconPen,
  IconTrash,
} from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import Modal from 'shared/components/modal/Modal';

import EditAction from '../editAction/EditAction';
import CancelModalContent from './CancelModalContent/CancelModalContent';
import {
  $Column,
  $CustomNotesActions,
  $Wrapper,
} from './HandlingApplicationActions.sc';
import { useHandlingApplicationActions } from './useHandlingApplicationActions';

export type Props = {
  application: Application;
};

const HandlingApplicationActions: React.FC<Props> = ({ application }) => {
  const {
    t,
    onDone,
    onBackToHandling,
    onSaveAndClose,
    toggleMessagesDrawerVisiblity,
    openDialog,
    closeDialog,
    handleCancel,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
    isConfirmationModalOpen,
  } = useHandlingApplicationActions(application);
  return (
    <$Wrapper>
      <$Column>
        {application.status === APPLICATION_STATUSES.HANDLING && (
          <Button onClick={onDone} theme="coat" disabled={isDisabledDoneButton}>
            {t(`${translationsBase}.done`)}
          </Button>
        )}
        <Button onClick={onSaveAndClose} theme="black" variant="secondary">
          {t(
            `${translationsBase}.${
              application.status === APPLICATION_STATUSES.HANDLING
                ? 'saveAndContinue'
                : 'close'
            }`
          )}
        </Button>
        {(application.status === APPLICATION_STATUSES.ACCEPTED ||
          application.status === APPLICATION_STATUSES.REJECTED) && (
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
      </$Column>
      {application.status !== APPLICATION_STATUSES.CANCELLED && (
        <$Column>
          <Button
            onClick={openDialog}
            theme="black"
            variant="supplementary"
            iconLeft={<IconTrash />}
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
      <Messenger
        isOpen={isMessagesDrawerVisible}
        isReadOnly={HANDLED_STATUSES.includes(
          application.status || APPLICATION_STATUSES.DRAFT
        )}
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
