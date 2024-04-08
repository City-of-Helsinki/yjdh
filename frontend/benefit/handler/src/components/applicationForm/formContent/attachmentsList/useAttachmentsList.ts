import useRemoveAttachmentQuery from 'benefit/handler/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/handler/hooks/useUploadAttachmentQuery';
import { ErrorResponse } from 'benefit/handler/types/common';
import { ApplicationData } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { BenefitAttachment } from 'shared/types/attachment';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  applicationId: string;
  attachments: [];
  isRemoving: boolean;
  isUploading: boolean;
  handleRemove: (attachmentId: string) => void;
  handleUpload: (attachment: FormData) => void;
  handleOpenFile: (attachment: BenefitAttachment) => void;
};

const useAttachmentsList = (
  handleQuietSave?: () => Promise<ApplicationData | void>,
  attachments?: BenefitAttachment[]
): ExtendedComponentProps => {
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
    error: uploadError
  } = useUploadAttachmentQuery();

  const [error, setError] = React.useState<ErrorResponse | null>( uploadError);

  React.useEffect(() => {
    if (isUploadingError) {
      setError(uploadError);
    }
  }, [isUploadingError, uploadError]);

  React.useEffect(() => {
    if (error?.response?.status === 400) {
      showErrorToast(t(`common:error.malware.errorTitle`), error?.response?.data?.non_field_errors[0]);
    }
    else if (isRemovingError) {
      showErrorToast(
        t(`common:error.attachments.title`),
        t(`common:error.attachments.generic`)
      );
    }
  }, [isRemovingError, error, t]);

  const handleOpenFile = React.useCallback(
    (file: BenefitAttachment) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      window.open(file.attachmentFile, '_blank')?.focus(),
    []
  );

  const handleRemove = async (attachmentId: string): Promise<void> => {
    const response = handleQuietSave ? await handleQuietSave() : true;
    const attachment = attachments?.find((file) => file.id === attachmentId);
    if (
      response &&
      // eslint-disable-next-line no-alert
      window.confirm(
        t('common:applications.sections.attachments.confirm', {
          name: attachment?.attachmentFileName,
        })
      )
    ) {
      removeAttachment({
        applicationId,
        attachmentId,
      });
    }
  };

  const handleUpload = async (attachment: FormData): Promise<void> => {
    const response = handleQuietSave ? await handleQuietSave() : true;
    if (response) {
      uploadAttachment({
        applicationId,
        data: attachment,
      });
    }
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
    handleOpenFile,
  };
};

export { useAttachmentsList };
