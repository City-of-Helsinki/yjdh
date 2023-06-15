import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import { BenefitAttachment } from 'shared/types/attachment';

import { useAttachmentsList } from './useAttachmentsList';

export type AttachmentsListProps = {
  attachmentType: ATTACHMENT_TYPES;
  attachments?: BenefitAttachment[];
  handleQuietSave?: () => void;
  required?: boolean;
  as?: 'div' | 'li';
};

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachmentType,
  attachments,
  handleQuietSave,
  required,
  as,
}) => {
  const {
    t,
    handleRemove,
    handleUpload,
    handleOpenFile,
    translationsBase,
    isRemoving,
    isUploading,
  } = useAttachmentsList(handleQuietSave);

  return (
    <AttachmentsListBase
      as={as}
      title={t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      attachmentType={attachmentType}
      name={attachmentType}
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

export default AttachmentsList;