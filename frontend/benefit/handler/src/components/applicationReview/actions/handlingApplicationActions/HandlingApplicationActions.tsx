import Messenger from 'benefit/handler/components/messenger/Messenger';
import { Application } from 'benefit/handler/types/application';
import {
  Button,
  IconInfoCircle,
  IconLock,
  IconPen,
  IconTrash,
  TextArea,
} from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';

import EditAction from '../editAction/EditAction';
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
    onCommentsChange,
    toggleMessagesDrawerVisiblity,
    // handleDelete,
    setIsConfirmationModalOpen,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
    isConfirmationModalOpen,
    cancelComments,
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
          onClick={() => setIsConfirmationModalOpen(true)}
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
          submitButtonLabel={t(`${translationsBase}.reasonCancelConfirm`)}
          handleToggle={() => setIsConfirmationModalOpen(false)}
          handleSubmit={noop}
          variant="danger"
          headerIcon={<IconInfoCircle />}
          submitButtonIcon={<IconTrash />}
        >
          <$Grid>
            <$GridCell $colSpan={12} $rowSpan={3}>
              {t(`${translationsBase}.reasonCancelDialogDescription`)}
            </$GridCell>
            <$GridCell $colSpan={12}>
              <TextArea
                id="proccessRejectedComments"
                name="proccessRejectedComments"
                label={t(`${translationsBase}.reasonCancelLabel`)}
                placeholder={t(`${translationsBase}.reasonCancelPlaceholder`)}
                onChange={onCommentsChange}
                value={cancelComments}
                required
              />
            </$GridCell>
          </$Grid>
        </Modal>
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
