import hdsToast from 'benefit/applicant/components/toast/Toast';
import {
  ATTACHMENT_MAX_SIZE,
  ATTACHMENT_TYPES,
} from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useUploadAttachmentQuery from 'benefit/applicant/hooks/useUploadAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  attachments: [];
  handleRemove: (index: number) => void;
  handleAdd: () => void;
  handleUploadClick: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadRef: React.RefObject<HTMLInputElement>;
};

const useAttachmentsList = (
  attachementType: ATTACHMENT_TYPES
): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id;
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  const { applicationTempData, setApplicationTempData } = React.useContext(
    ApplicationContext
  );

  const { mutate: uploadAttachment } = useUploadAttachmentQuery();

  const uploadRef = React.createRef<HTMLInputElement>();

  const handleUploadClick = (): void => {
    void uploadRef?.current?.click();
  };

  const resetUploadInput = (): void => {
    if (uploadRef.current?.value) {
      uploadRef.current.value = '';
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // console.log(e.target.files);
    const file = e.target.files?.[0];
    const fileSize = file?.size;
    // validate file size and extention
    if (fileSize && fileSize > ATTACHMENT_MAX_SIZE) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.attachments.title'),
        text: t('common:error.attachments.tooBig'),
      });
      resetUploadInput();
      return;
    }
    // todo: check file type

    if (file) {
      const formData = new FormData();
      formData.append('attachment_type', attachementType);
      formData.append('attachment_file', file);
      uploadAttachment({
        applicationId: applicationTempData.id || id?.toString() || '',
        data: formData,
      });
    }
  };

  const handleRemove = (index: number): void => {
    // remove value
    const currentGrants = [...(applicationTempData.deMinimisAids || [])];
    currentGrants.splice(index, 1);
    setApplicationTempData({
      ...applicationTempData,
      deMinimisAids: currentGrants,
    });
  };

  const handleAdd = (): void => {
    // add value
    const currentGrants = [...(applicationTempData.deMinimisAids || [])];
    currentGrants.splice(1, 1);
    setApplicationTempData({
      ...applicationTempData,
      deMinimisAids: currentGrants,
    });
  };

  return {
    t,
    attachments: [],
    translationsBase,
    uploadRef,
    handleRemove,
    handleAdd,
    handleUploadClick,
    handleUpload,
  };
};

export { useAttachmentsList };
