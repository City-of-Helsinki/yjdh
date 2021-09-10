import { $PrimaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { Attachment } from 'benefit/applicant/types/application';
import { IconPlus } from 'hds-react';
import camelCase from 'lodash/camelCase';
import * as React from 'react';

import AttachmentItem from './attachmentItem/AttachmentItem';
import {
  $Container,
  $Heading,
  $Message,
  $UploadContainer,
} from './AttachmentsList.sc';
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
    handleUploadClick,
    handleUpload,
    handleRemove,
    translationsBase,
    uploadRef,
    files,
    isUploading,
    isRemoving,
  } = useAttachmentsList(attachmentType, attachments);

  return (
    <$Container>
      <$Heading>
        {t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      </$Heading>
      {files && files.length > 0 ? (
        <>
          {files?.map((file) => (
            <AttachmentItem
              key={file.id}
              id={file.id}
              name={file.attachmentFileName}
              removeText={t(`${translationsBase}.remove`)}
              onClick={() =>
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                window.open(file.attachmentFile, '_blank')?.focus()
              }
              onRemove={() => !isRemoving && handleRemove(file.id)}
            />
          ))}
        </>
      ) : (
        <>
          {showMessage && (
            <$Message>
              {t(
                `${translationsBase}.types.${camelCase(attachmentType)}.message`
              )}
            </$Message>
          )}
        </>
      )}
      <$UploadContainer onClick={handleUploadClick}>
        <$PrimaryButton
          isLoading={isUploading}
          loadingText={t(`common:upload.isUploading`)}
          style={{ width: 'auto' }}
          iconLeft={<IconPlus />}
        >
          {t(`${translationsBase}.add`)}
        </$PrimaryButton>
        <input
          style={{ display: 'none' }}
          ref={uploadRef}
          onChange={handleUpload}
          id={`upload_attachment_${attachmentType}`}
          type="file"
        />
      </$UploadContainer>
    </$Container>
  );
};

const defaultProps = {
  showMessage: true,
};

AttachmentsList.defaultProps = defaultProps;

export default AttachmentsList;
