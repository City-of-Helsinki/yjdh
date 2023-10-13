import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import camelCase from 'lodash/camelCase';
import { TFunction } from 'next-i18next';
import * as React from 'react';
import AttachmentsListBase from 'shared/components/attachments/AttachmentsList';
import { BenefitAttachment } from 'shared/types/attachment';

import { useAttachmentsList } from './useAttachmentsList';

export type AttachmentsListProps = {
  attachmentType: ATTACHMENT_TYPES;
  attachmentTypeTranslationKey?: string;
  showMessage?: boolean;
  attachments?: BenefitAttachment[];
  required?: boolean;
  as?: 'div' | 'li';
};

const getTitleTranslation = (
  t: TFunction,
  translationsBase: string,
  attachmentType: ATTACHMENT_TYPES,
  attachmentTypeTranslationKey: string
): string => {
  const key = attachmentTypeTranslationKey
    ? String(attachmentTypeTranslationKey)
    : attachmentType;
  return t(`${translationsBase}.types.${camelCase(key)}.title`);
};

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachmentType,
  attachmentTypeTranslationKey,
  showMessage = true,
  attachments,
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
  } = useAttachmentsList();

  const message = t(
    `${translationsBase}.types.${camelCase(attachmentType)}.message`
  );

  return (
    <AttachmentsListBase
      as={as}
      title={getTitleTranslation(
        t,
        translationsBase,
        attachmentType,
        attachmentTypeTranslationKey
      )}
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

export default AttachmentsList;
