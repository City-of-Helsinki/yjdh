import {
  ButtonPresetTheme,
  ButtonVariant,
  Dialog,
  IconAlertCircle,
  IconTrash,
} from 'hds-react';
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
  const titleId = `delete-note-title-${id}`;
  const descriptionId = `delete-note-desc-${id}`;

  return (
    <Dialog
      variant="danger"
      id={`delete-note-dialog-${id}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText={t('common:common.close')}
    >
      <Dialog.Header
        id={titleId}
        title={t('common:handlerNotes.deleteConfirmTitle')}
        iconStart={<IconAlertCircle aria-hidden />}
      />
      <Dialog.Content>
        <p id={descriptionId}>{t('common:handlerNotes.deleteConfirmText')}</p>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          onClick={onClose}
        >
          {t('common:common.cancel')}
        </Button>
        <Button
          variant={ButtonVariant.Danger}
          iconStart={<IconTrash aria-hidden />}
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
