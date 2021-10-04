import { IconPlus } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import AttachmentItem from 'shared/components/attachments/AttachmentItem';
import UploadAttachment from 'shared/components/attachments/UploadAttachment';
import { ATTACHMENT_CONTENT_TYPES, ATTACHMENT_MAX_SIZE } from 'shared/contants/attachment-constants';
import Attachment from 'shared/types/attachment';

import { $Container, $Heading, $Message } from './AttachmentsList.sc';

type Props = {
  title: string;
  attachmentType: string;
  allowedFileTypes?: readonly string[];
  maxSize?: number;
  message?: string | false;
  attachments?: Attachment[];
  onUpload: (data: FormData) => void;
  onRemove: (fileId: string) => void;
  isUploading: boolean;
  isRemoving: boolean;
};

const AttachmentsList: React.FC<Props> = ({
  title,
  attachmentType,
  allowedFileTypes = ATTACHMENT_CONTENT_TYPES,
  maxSize = ATTACHMENT_MAX_SIZE,
  message,
  attachments,
  onUpload,
  onRemove,
  isUploading,
  isRemoving,
}) => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  console.log('attachments',attachments);
  const files = React.useMemo(
    (): Attachment[] =>
      attachments?.filter((att) => att.attachmentType === attachmentType || att.attachment_type === attachmentType) || [],
    [attachmentType, attachments]
  );

  return (
    <$Container>
      <$Heading>{title}</$Heading>
      {files && files.length > 0 ? (
        <>
          {files.map((file) => (
            <AttachmentItem
              key={file.id}
              id={file.id}
              name={file.attachmentFileName}
              removeText={t(`${translationsBase}.remove`)}
              onClick={() =>
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                window.open(file.attachmentFile, '_blank')?.focus()
              }
              onRemove={() => !isRemoving && onRemove(file.id)}
            />
          ))}
        </>
      ) : (
        <>{message && <$Message>{message}</$Message>}</>
      )}
      <UploadAttachment
        theme="coat"
        variant="primary"
        onUpload={onUpload}
        isUploading={isUploading}
        attachmentType={attachmentType}
        allowedFileTypes={allowedFileTypes}
        maxSize={maxSize}
        icon={<IconPlus />}
        uploadText={t(`${translationsBase}.add`)}
        loadingText={t(`common:upload.isUploading`)}
        errorTitle={t('common:error.attachments.title')}
        errorFileSizeText={t('common:error.attachments.tooBig')}
        errorFileTypeText={t('common:error.attachments.fileType')}
      />
    </$Container>
  );
};

export default AttachmentsList;
