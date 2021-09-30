import {
  ATTACHMENT_ALLOWED_TYPES,
  ATTACHMENT_MAX_SIZE,
  ATTACHMENT_TYPES,
} from 'benefit/applicant/constants';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import Attachment from 'shared/types/attachment';

import { useAttachmentsList } from './useAttachmentsList';

export interface AttachmentsListProps {
  attachmentType: ATTACHMENT_TYPES;
  showMessage?: boolean;
  attachments?: Attachment[];
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachmentType,
  showMessage,
  attachments,
}) => {
  const {
    t,
    handleRemove,
    handleUpload,
    translationsBase,
    isRemoving,
    isUploading,
  } = useAttachmentsList();

  return (
    <AttachmentsListBase
      title={t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      attachmentType={attachmentType}
      allowedFileTypes={ATTACHMENT_ALLOWED_TYPES}
      maxSize={ATTACHMENT_MAX_SIZE}
      message={
        showMessage &&
        `${translationsBase}.types.${camelCase(attachmentType)}.message`
      }
      attachments={attachments}
      onUpload={handleUpload}
      onRemove={handleRemove}
      isUploading={isUploading}
      isRemoving={isRemoving}
    />
  );
};

const defaultProps = {
  showMessage: true,
};

AttachmentsList.defaultProps = defaultProps;

export default AttachmentsList;
