import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import * as React from 'react';

import { $Button } from '../Applications.sc';
import { useUploadAttachment } from './useUploadAttachment';

export interface UploadAttachmentProps {
  onUpload: (data: FormData) => void;
  isUploading: boolean;
  attachmentType: ATTACHMENT_TYPES;
  allowedFileTypes: string[];
  maxSize: number;
  uploadText: string;
  loadingText: string;
  errorTitle: string;
  errorFileSizeText: string;
  errorFileTypeText: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const UploadAttachment: React.FC<UploadAttachmentProps> = ({
  attachmentType,
  allowedFileTypes,
  maxSize,
  icon,
  variant,
  isUploading,
  uploadText,
  loadingText,
  errorTitle,
  errorFileSizeText,
  errorFileTypeText,
  onUpload,
}) => {
  const { handleUploadClick, handleUpload, uploadRef } = useUploadAttachment(
    attachmentType,
    allowedFileTypes,
    maxSize,
    errorTitle,
    errorFileSizeText,
    errorFileTypeText,
    onUpload
  );

  return (
    <div>
      <$Button
        onClick={handleUploadClick}
        variant={variant}
        isLoading={isUploading}
        loadingText={loadingText}
        iconLeft={icon}
      >
        {uploadText}
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
