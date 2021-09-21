import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import * as React from 'react';

import { $Button } from '../Applications.sc';
import { useUploadAttachment } from './useUploadAttachment';

export interface UploadAttachmentProps {
  applicationId: string;
  attachmentType: ATTACHMENT_TYPES;
  allowedFileTypes: string[];
  maxSize: number;
  uploadText?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const UploadAttachment: React.FC<UploadAttachmentProps> = ({
  applicationId,
  attachmentType,
  allowedFileTypes,
  maxSize,
  icon,
  variant,
  uploadText,
}) => {
  const {
    t,
    handleUploadClick,
    handleUpload,
    translationsBase,
    uploadRef,
    isUploading,
  } = useUploadAttachment(
    applicationId,
    attachmentType,
    allowedFileTypes,
    maxSize
  );

  return (
    <div>
      <$Button
        onClick={handleUploadClick}
        variant={variant}
        isLoading={isUploading}
        loadingText={t(`common:upload.isUploading`)}
        iconLeft={icon}
      >
        {uploadText || t(`${translationsBase}.add`)}
      </$Button>
      <input
        style={{ display: 'none' }}
        ref={uploadRef}
        onChange={handleUpload}
        id={`upload_attachment_${attachmentType}`}
        type="file"
      />
    </div>
  );
};

export default UploadAttachment;
