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
  onUploadSuccess?: (attachment: BenefitAttachment) => void;
  onRemoveSuccess?: (attachmentId: string) => void;
};

const getTitleTranslation = (
  t: TFunction,
  translationsBase: string,
  attachmentType: ATTACHMENT_TYPES,
  attachmentTypeTranslationKey: string | undefined
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
  onUploadSuccess,
  onRemoveSuccess,
}) => {
  const [visibleAttachments, setVisibleAttachments] = React.useState<
    BenefitAttachment[]
  >(attachments ?? []);

  React.useEffect(() => {
    setVisibleAttachments(attachments ?? []);
  }, [attachments]);

  const {
    t,
    handleRemove,
    handleUpload,
    handleOpenFile,
    translationsBase,
    isRemoving,
    isUploading,
  } = useAttachmentsList(
    (uploadedAttachment) => {
      setVisibleAttachments((currentAttachments) => [
        ...currentAttachments,
        uploadedAttachment,
      ]);
      onUploadSuccess?.(uploadedAttachment);
    },
    (removedAttachmentId) => {
      setVisibleAttachments((currentAttachments) =>
        currentAttachments.filter(
          (attachment) => attachment.id !== removedAttachmentId
        )
      );
      onRemoveSuccess?.(removedAttachmentId);
    }
  );

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
        attachmentTypeTranslationKey || ''
      )}
      attachmentType={attachmentType}
      name={attachmentType}
      message={showMessage && message}
      attachments={visibleAttachments}
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
