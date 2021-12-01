import { IconAlertCircleFill, IconPlus } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import AttachmentItem from 'shared/components/attachments/AttachmentItem';
import UploadAttachment from 'shared/components/attachments/UploadAttachment';
import {
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_MAX_SIZE,
} from 'shared/constants/attachment-constants';
import Attachment from 'shared/types/attachment';
import { getAttachmentsByType } from 'shared/utils/attachment.utils';

import {
  $Container,
  $ErrorMessage,
  $Heading,
  $Message,
} from './AttachmentsList.sc';

type Props<T extends Attachment> = {
  title: string;
  attachmentType: string;
  allowedFileTypes?: readonly string[];
  maxSize?: number;
  message?: string | false;
  errorMessage?: string | false;
  attachments?: T[];
  onUpload: (data: FormData) => void | Promise<void>;
  onRemove: (fileId: string) => void | Promise<void>;
  onOpen: (attachment: T) => void | Promise<void>;
  isUploading: boolean;
  isRemoving: boolean;
  required?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
  name?: string;
};

const AttachmentsList = <T extends Attachment>({
  title,
  attachmentType,
  allowedFileTypes = ATTACHMENT_CONTENT_TYPES,
  maxSize = ATTACHMENT_MAX_SIZE,
  message,
  errorMessage,
  attachments,
  onUpload,
  onRemove,
  onOpen,
  isUploading,
  isRemoving,
  required,
  name,
  buttonRef,
}: Props<T>): JSX.Element => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';

  const files = React.useMemo(
    (): T[] => getAttachmentsByType(attachments ?? [], attachmentType),
    [attachmentType, attachments]
  );
  const uploadText = t(`${translationsBase}.add`);

  return (
    <$Container>
      <$Heading>
        {title} {required && ' *'}
      </$Heading>
      {files && files.length > 0 ? (
        <>
          {files.map((file) => (
            <AttachmentItem
              key={file.id}
              id={file.id}
              name={
                'attachmentFileName' in file
                  ? file.attachmentFileName
                  : file.attachment_file_name
              }
              removeText={t(`${translationsBase}.remove`)}
              onClick={() => onOpen(file)}
              onRemove={() => !isRemoving && onRemove(file.id)}
            />
          ))}
        </>
      ) : (
        <>{message && <$Message>{message}</$Message>}</>
      )}
      <UploadAttachment
        buttonRef={buttonRef}
        name={name}
        theme="coat"
        variant="primary"
        onUpload={onUpload}
        isUploading={isUploading}
        attachmentType={attachmentType}
        allowedFileTypes={allowedFileTypes}
        maxSize={maxSize}
        icon={<IconPlus />}
        ariaUploadText={`${title} - ${uploadText}`}
        uploadText={uploadText}
        loadingText={t(`common:upload.isUploading`)}
        errorTitle={t('common:error.attachments.title')}
        errorFileSizeText={t('common:error.attachments.tooBig')}
        errorFileTypeText={t('common:error.attachments.fileType')}
      />
      {errorMessage && (
        <$ErrorMessage>
          <IconAlertCircleFill size="s" />
          {errorMessage}
        </$ErrorMessage>
      )}
    </$Container>
  );
};

AttachmentsList.defaultProps = {
  allowedFileTypes: ATTACHMENT_CONTENT_TYPES,
  maxSize: ATTACHMENT_MAX_SIZE,
  message: '',
  errorMessage: '',
  attachments: [],
  required: false,
  buttonRef: null,
  name: '',
};

export default AttachmentsList;
