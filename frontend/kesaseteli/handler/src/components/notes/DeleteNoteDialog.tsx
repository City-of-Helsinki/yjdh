import { ButtonVariant, Dialog } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Button from 'shared/components/button/Button';

type DeleteDialogProps = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

const DeleteNoteDialog: React.FC<DeleteDialogProps> = ({
  id,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      id={`delete-note-dialog-${id}`}
      aria-labelledby={`delete-note-title-${id}`}
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText={t('common:common.close')}
    >
      <Dialog.Header
        id={`delete-note-title-${id}`}
        title={t('common:handlerNotes.deleteConfirmTitle')}
      />
      <Dialog.Content>
        <p>{t('common:handlerNotes.deleteConfirmText')}</p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button variant={ButtonVariant.Secondary} onClick={onClose}>
          {t('common:common.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          isLoading={isDeleting}
          loadingText={t('common:common.deleting')}
          disabled={isDeleting}
          data-testid={`note-delete-confirm-button-${id}`}
        >
          {t('common:handlerNotes.deleteConfirmButton')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default DeleteNoteDialog;
