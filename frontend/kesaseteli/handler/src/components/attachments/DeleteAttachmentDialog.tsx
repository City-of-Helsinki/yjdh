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
import type { KesaseteliAttachment } from 'shared/types/attachment';

type Props = {
  attachment: KesaseteliAttachment;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteAttachmentDialog: React.FC<Props> = ({
  attachment,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const titleId = `delete-attachment-title-${attachment.id}`;
  const descriptionId = `delete-attachment-desc-${attachment.id}`;

  return (
    <Dialog
      variant="danger"
      id={`delete-attachment-dialog-${attachment.id}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText={t('common:common.close')}
    >
      <Dialog.Header
        id={titleId}
        title={t('common:dialog.deleteAttachmentHeader')}
        iconStart={<IconAlertCircle aria-hidden />}
      />
      <Dialog.Content>
        <p id={descriptionId}>
          {t('common:dialog.deleteAttachmentContent', {
            name: attachment.attachment_file_name,
          })}
        </p>
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
          data-testid={`delete-attachment-confirm-button-${attachment.id}`}
        >
          {t('common:dialog.deleteAttachmentSubmit')}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default DeleteAttachmentDialog;
