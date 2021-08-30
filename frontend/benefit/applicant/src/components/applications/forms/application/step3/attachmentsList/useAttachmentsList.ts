import {
  ATTACHMENT_ALLOWED_TYPES,
  ATTACHMENT_MAX_SIZE,
  ATTACHMENT_TYPES,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useRemoveAttachmentQuery from 'benefit/applicant/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/applicant/hooks/useUploadAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Attachment } from 'benefit/applicant/types/application';
import { showErrorToast } from 'benefit/applicant/utils/common';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect } from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  attachments: [];
  handleUploadClick: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemove: (attachmentId: string) => void;
  uploadRef: React.RefObject<HTMLInputElement>;
  files?: Attachment[];
  isUploading: boolean;
  isRemoving: boolean;
};

const useAttachmentsList = (
  attachmentType: ATTACHMENT_TYPES,
  attachments?: Attachment[]
): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id;
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  const { applicationTempData } = React.useContext(ApplicationContext);

  const {
    mutate: uploadAttachment,
    isLoading: isUploading,
    isError: isUploadingError,
  } = useUploadAttachmentQuery();

  const {
    mutate: removeAttachment,
    isLoading: isRemoving,
    isError: isRemovingError,
  } = useRemoveAttachmentQuery();

  useEffect(() => {
    if (isUploadingError || isRemovingError) {
      const prefix = isUploadingError ? 'upload' : 'remove';
      showErrorToast(
        t(`common:${prefix}.errorTitle`),
        t(`common:${prefix}.errorMessage`)
      );
    }
  }, [isUploadingError, isRemovingError, t]);

  const uploadRef = React.createRef<HTMLInputElement>();

  const files = React.useMemo(
    (): Attachment[] =>
      attachments?.filter((att) => att.attachmentType === attachmentType) || [],
    [attachmentType, attachments]
  );

  const handleUploadClick = (): void => {
    void uploadRef?.current?.click();
  };

  const resetUploadInput = (): void => {
    if (uploadRef.current?.value) {
      uploadRef.current.value = '';
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    const fileSize = file?.size;
    // validate file extention
    if (!ATTACHMENT_ALLOWED_TYPES.includes(file?.type || '')) {
      showErrorToast(
        t('common:error.attachments.title'),
        t('common:error.attachments.fileType')
      );
      resetUploadInput();
      return;
    }
    // validate file size
    if (fileSize && fileSize > ATTACHMENT_MAX_SIZE) {
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
        applicationId: applicationTempData.id || id?.toString() || '',
        data: formData,
      });
    }
  };

  const handleRemove = (attachmentId: string): void => {
    removeAttachment({
      applicationId: applicationTempData.id || id?.toString() || '',
      attachmentId,
    });
  };

  return {
    t,
    attachments: [],
    translationsBase,
    uploadRef,
    files,
    isUploading,
    isRemoving,
    handleUploadClick,
    handleUpload,
    handleRemove,
  };
};

export { useAttachmentsList };
