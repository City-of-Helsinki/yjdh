import AttachmentItem from 'benefit/applicant/components/applications/attachmentItem/AttachmentItem';
import UploadAttachment from 'benefit/applicant/components/applications/uploadAttachment/UploadAttachment';
import {
  ATTACHMENT_ALLOWED_TYPES,
  ATTACHMENT_MAX_SIZE,
  ATTACHMENT_TYPES,
} from 'benefit/applicant/constants';
import { Attachment } from 'benefit/applicant/types/application';
import { IconArrowRight } from 'hds-react';
import camelCase from 'lodash/camelCase';
import * as React from 'react';

import { $Container, $Heading, $Message } from './AttachmentsList.sc';
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
    translationsBase,
    files,
    isRemoving,
    applicationId,
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
      <UploadAttachment
        applicationId={applicationId}
        attachmentType={attachmentType}
        allowedFileTypes={ATTACHMENT_ALLOWED_TYPES}
        maxSize={ATTACHMENT_MAX_SIZE}
        uploadText={t(`${translationsBase}.add`)}
        variant="primary"
        icon={<IconArrowRight />}
      />
    </$Container>
  );
};

const defaultProps = {
  showMessage: true,
};

AttachmentsList.defaultProps = defaultProps;

export default AttachmentsList;
