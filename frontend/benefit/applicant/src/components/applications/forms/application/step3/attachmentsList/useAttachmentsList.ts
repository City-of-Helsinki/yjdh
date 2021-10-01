import useRemoveAttachmentQuery from 'benefit/applicant/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/applicant/hooks/useUploadAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  applicationId: string;
  attachments: [];
  isRemoving: boolean;
  isUploading: boolean;
  handleRemove: (attachmentId: string) => void;
  handleUpload: (attachment: FormData) => void;
};

const useAttachmentsList = (): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id;
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';

  const applicationId = id?.toString() || '';

  const {
    mutate: removeAttachment,
    isLoading: isRemoving,
    isError: isRemovingError,
  } = useRemoveAttachmentQuery();

  const {
    mutate: uploadAttachment,
    isLoading: isUploading,
    isError: isUploadingError,
  } = useUploadAttachmentQuery();

  useEffect(() => {
    if (isRemovingError || isUploadingError) {
      showErrorToast(
        t(`common:remove.errorTitle`),
        t(`common:remove.errorMessage`)
      );
    }
  }, [isRemovingError, isUploadingError, t]);

  const handleRemove = (attachmentId: string): void => {
    removeAttachment({
      applicationId,
      attachmentId,
    });
  };

  const handleUpload = (attachment: FormData): void => {
    uploadAttachment({
      applicationId,
      data: attachment,
    });
  };

  return {
    t,
    applicationId,
    attachments: [],
    translationsBase,
    isRemoving,
    isUploading,
    handleRemove,
    handleUpload,
  };
};

export { useAttachmentsList };
