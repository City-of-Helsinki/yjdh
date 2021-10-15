import React from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';

type ExtendedComponentProps = {
  handleUploadClick: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadRef: React.RefObject<HTMLInputElement>;
};

const useUploadAttachment = (
  attachmentType: string,
  allowedFileTypes: readonly string[],
  maxSize: number,
  errorTitle: string,
  errorFileSizeText: string,
  errorFileTypeText: string,
  onUpload: (data: FormData) => void
): ExtendedComponentProps => {
  const uploadRef = React.createRef<HTMLInputElement>();

  const resetUploadInput = React.useCallback(() => {
    if (uploadRef.current?.value) {
      uploadRef.current.value = '';
    }
  }, [uploadRef]);

  const handleUploadClick = (): void => {
    void uploadRef.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSize = file.size;
    // validate file extention
    if (!allowedFileTypes.includes(file.type || '')) {
      showErrorToast(errorTitle, errorFileTypeText);
      resetUploadInput();
      return;
    }
    // validate file size
    if (fileSize && fileSize > maxSize) {
      showErrorToast(errorTitle, errorFileSizeText);
      resetUploadInput();
      return;
    }

    const formData = new FormData();
    formData.append('attachment_type', attachmentType);
    formData.append('attachment_file', file);
    onUpload(formData);
    resetUploadInput();
  };

  return {
    handleUploadClick,
    handleUpload,
    uploadRef,
  };
};

export { useUploadAttachment };
