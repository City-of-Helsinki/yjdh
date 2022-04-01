import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import { BenefitAttachment } from 'shared/types/attachment';

import { useAttachmentsList } from './useAttachmentsList';

export type AttachmentsListProps = {
  attachmentType: ATTACHMENT_TYPES;
  showMessage?: boolean;
  attachments?: BenefitAttachment[];
  required?: boolean;
};

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachmentType,
  showMessage = true,
  attachments,
  required,
}) => {
  const {
    t,
    handleRemove,
    handleUpload,
    handleOpenFile,
    translationsBase,
    isRemoving,
    isUploading,
  } = useAttachmentsList();

  const message = t(
    `${translationsBase}.types.${camelCase(attachmentType)}.message`
  );

  return (
    <AttachmentsListBase
      title={t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      attachmentType={attachmentType}
      name={attachmentType}
      message={showMessage && message}
      attachments={attachments}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onOpen={handleOpenFile}
      isUploading={isUploading}
      isRemoving={isRemoving}
      required={required}
    />
  );
};

AttachmentsList.defaultProps = {
  showMessage: undefined,
  attachments: undefined,
  required: undefined,
};

export default AttachmentsList;
