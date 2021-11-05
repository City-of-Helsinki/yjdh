import { Button, ButtonTheme } from 'hds-react';
import * as React from 'react';

import { useUploadAttachment } from './useUploadAttachment';

export interface UploadAttachmentProps {
  onUpload: (data: FormData) => void;
  isUploading: boolean;
  attachmentType: string;
  allowedFileTypes: readonly string[];
  maxSize: number;
  uploadText: string;
  loadingText: string;
  errorTitle: string;
  errorFileSizeText: string;
  errorFileTypeText: string;
  theme: ButtonTheme;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  name?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

const UploadAttachment: React.FC<UploadAttachmentProps> = ({
  attachmentType,
  allowedFileTypes,
  maxSize,
  theme,
  icon,
  variant,
  isUploading,
  uploadText,
  loadingText,
  errorTitle,
  errorFileSizeText,
  errorFileTypeText,
  onUpload,
  name,
  buttonRef,
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
      <Button
        theme={theme}
        onClick={handleUploadClick}
        variant={variant}
        isLoading={isUploading}
        loadingText={loadingText}
        iconLeft={icon}
        ref={buttonRef}
      >
        {uploadText}
      </Button>
      <input
        style={{ display: 'none' }}
        name={name}
        ref={uploadRef}
        onChange={handleUpload}
        id={`upload_attachment_${attachmentType}`}
        type="file"
      />
    </div>
  );
};

export default UploadAttachment;
