import { $PrimaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { IconPlus } from 'hds-react';
import camelCase from 'lodash/camelCase';
import noop from 'lodash/noop';
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
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachmentType,
  showMessage,
}) => {
  const {
    t,
    translationsBase,
    attachments,
    uploadRef,
    handleUploadClick,
    handleUpload,
  } = useAttachmentsList(attachmentType);

  return (
    <$Container>
      <$Heading>
        {t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      </$Heading>
      {attachments.length > 0 ? (
        <AttachmentItem
          id="testId"
          name="palkkatukipaatos-teemurantamaki.PDF"
          removeText={t(`${translationsBase}.remove`)}
          onClick={noop}
          onRemove={noop}
        />
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
        <$PrimaryButton style={{ width: 'auto' }} iconLeft={<IconPlus />}>
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
