import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import useUploadAttachmentQuery from 'benefit/applicant/hooks/useUploadAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { showErrorToast } from 'benefit/applicant/utils/common';
import { TFunction } from 'next-i18next';
import React, { useEffect } from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  handleUploadClick: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadRef: React.RefObject<HTMLInputElement>;
  isUploading: boolean;
};

const useUploadAttachment = (
  applicationId: string,
  attachmentType: ATTACHMENT_TYPES,
  allowedFileTypes: string[],
  maxSize: number
): ExtendedComponentProps => {
  const uploadRef = React.createRef<HTMLInputElement>();
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';

  const {
    mutate: uploadAttachment,
    isLoading: isUploading,
    isError: isUploadingError,
    isSuccess: isUploadSuccess,
  } = useUploadAttachmentQuery();

  useEffect(() => {
    if (isUploadingError) {
      showErrorToast(
        t(`common:upload.errorTitle`),
        t(`common:upload.errorMessage`)
      );
    }
  }, [isUploadingError, t]);

  const resetUploadInput = React.useCallback(() => {
    if (uploadRef.current?.value) {
      uploadRef.current.value = '';
    }
  }, [uploadRef]);

  useEffect(() => {
    if (isUploadSuccess) {
      resetUploadInput();
    }
  }, [isUploadSuccess, resetUploadInput]);

  const handleUploadClick = (): void => {
    void uploadRef?.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    const fileSize = file?.size;
    // validate file extention
    if (file && !allowedFileTypes.includes(file?.type || '')) {
      showErrorToast(
        t('common:error.attachments.title'),
        t('common:error.attachments.fileType')
      );
      resetUploadInput();
      return;
    }
    // validate file size
    if (fileSize && fileSize > maxSize) {
      showErrorToast(
        t('common:error.attachments.title'),
        t('common:error.attachments.tooBig')
      );
      resetUploadInput();
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append('attachment_type', attachmentType);
      formData.append('attachment_file', file);
      uploadAttachment({
        applicationId,
        data: formData,
      });
    }
  };

  return {
    t,
    handleUploadClick,
    handleUpload,
    translationsBase,
    uploadRef,
    isUploading,
  };
};

export { useUploadAttachment };
