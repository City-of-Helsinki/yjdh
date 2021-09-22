import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { showErrorToast } from 'benefit/applicant/utils/common';
import { TFunction } from 'next-i18next';
import React from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  handleUploadClick: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadRef: React.RefObject<HTMLInputElement>;
};

const useUploadAttachment = (
  attachmentType: ATTACHMENT_TYPES,
  allowedFileTypes: string[],
  maxSize: number,
  errorTitle: string,
  errorFileSizeText: string,
  errorFileTypeText: string,
  onUpload: (data: FormData) => void
): ExtendedComponentProps => {
  const uploadRef = React.createRef<HTMLInputElement>();
  const { t } = useTranslation();

  const resetUploadInput = React.useCallback(() => {
    if (uploadRef.current?.value) {
      uploadRef.current.value = '';
    }
  }, [uploadRef]);

  const handleUploadClick = (): void => {
    void uploadRef?.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    const fileSize = file?.size;
    // validate file extention
    if (file && !allowedFileTypes.includes(file?.type || '')) {
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

    if (file) {
      const formData = new FormData();
      formData.append('attachment_type', attachmentType);
      formData.append('attachment_file', file);
      onUpload(formData);
      resetUploadInput();
    }
  };

  return {
    t,
    handleUploadClick,
    handleUpload,
    uploadRef,
  };
};

export { useUploadAttachment };
