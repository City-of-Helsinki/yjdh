import { Button, ButtonTheme } from 'hds-react';
import * as React from 'react';

import { useUploadAttachment } from './useUploadAttachment';

export interface UploadAttachmentProps {
  onUpload: (data: FormData) => void;
  isUploading: boolean;
  attachmentType: string;
  allowedFileTypes: readonly string[];
  maxSize: number;
  ariaUploadText?: string;
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
  ariaUploadText,
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
        id={name}
        theme={theme}
        onClick={handleUploadClick}
        variant={variant}
        isLoading={isUploading}
        loadingText={loadingText}
        iconLeft={icon}
        ref={buttonRef}
        aria-label={ariaUploadText}
      >
        {uploadText}
      </Button>
      <input
        style={{ display: 'none' }}
        name={name}
        ref={uploadRef}
        onChange={handleUpload}
        data-testid={name}
        id={`upload_attachment_${attachmentType}`}
        type="file"
      />
    </div>
  );
};

UploadAttachment.defaultProps = {
  ariaUploadText: undefined,
  icon: undefined,
  variant: undefined,
  name: undefined,
  buttonRef: undefined,
};

export default UploadAttachment;
