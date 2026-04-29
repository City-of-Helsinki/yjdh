import { Button, ButtonProps } from 'hds-react';
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
  theme: ButtonProps['theme'];
  icon?: React.ReactNode;
  variant?: ButtonProps['variant'];
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
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        theme={theme}
        onClick={handleUploadClick}
        variant={variant}
        isLoading={isUploading}
        loadingText={loadingText}
        iconEnd={null}
        iconStart={icon}
        ref={buttonRef}
        aria-label={ariaUploadText}
      >
        {uploadText}
      </Button>
      <input
        style={{ display: 'none' }}
        name={name}
        ref={uploadRef}
        accept={allowedFileTypes.join(', ')}
        onChange={handleUpload}
        data-testid={name}
        id={`upload_attachment_${attachmentType}`}
        type="file"
      />
    </div>
  );
};

export default UploadAttachment;
