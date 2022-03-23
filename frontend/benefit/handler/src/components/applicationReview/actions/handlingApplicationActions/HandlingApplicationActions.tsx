import Messenger from 'benefit/handler/components/messenger/Messenger';
import { Application } from 'benefit/handler/types/application';
import {
  Button,
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
        <Button onClick={onDone} theme="coat" disabled={isDisabledDoneButton}>
          {t(`${translationsBase}.done`)}
        </Button>
        <Button onClick={onSaveAndClose} theme="black" variant="secondary">
          {t(`${translationsBase}.saveAndContinue`)}
        </Button>
        <Button
          onClick={toggleMessagesDrawerVisiblity}
          theme="black"
          variant="secondary"
          iconLeft={<IconPen />}
        >
          {t(`${translationsBase}.handlingPanel`)}
        </Button>
      </$Column>
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
      {isConfirmationModalOpen && (
        <Modal
          id="Handler-confirmDeleteApplicationModal"
          isOpen={isConfirmationModalOpen}
          title={t(`${translationsBase}.reasonCancelDialogTitle`)}
          submitButtonLabel=""
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
