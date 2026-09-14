import { Dialog } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import type { KesaseteliAttachment } from 'shared/types/attachment';

import { NoteTargetType } from '../../types/note';
import NotesSection from '../notes/NotesSection';

type Props = {
  attachment: KesaseteliAttachment;
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AttachmentCommentsDialog: React.FC<Props> = ({
  attachment,
  applicationId,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      id={`attachment-comments-dialog-${attachment.id}`}
      aria-labelledby={`attachment-comments-title-${attachment.id}`}
      isOpen={isOpen}
      close={onClose}
      closeButtonLabelText={t('common:common.close')}
    >
      <Dialog.Header
        id={`attachment-comments-title-${attachment.id}`}
        title={attachment.attachment_file_name}
      />
      <Dialog.Content>
        <NotesSection
          targetId={attachment.id}
          targetType={NoteTargetType.ATTACHMENT}
          parentApplicationId={applicationId}
          showTimeline
        />
      </Dialog.Content>
    </Dialog>
  );
};

export default AttachmentCommentsDialog;
