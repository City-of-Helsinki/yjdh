import useRemoveAttachmentQuery from 'benefit/applicant/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/applicant/hooks/useUploadAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { ErrorResponse } from 'benefit/applicant/types/common';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
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
    error: uploadError,
  } = useUploadAttachmentQuery();

  const [error, setError] = React.useState<ErrorResponse | null>(uploadError);

  React.useEffect(() => {
    if (isUploadingError) {
      setError(uploadError);
    }
  }, [isUploadingError, uploadError]);

  React.useEffect(() => {
    if (error && !error?.response?.data) {
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      );
      return;
    }
    if (error?.response?.status >= 400) {
      const backendValidationError =
        error?.response?.data?.non_field_errors?.at(0);
      const malwareError =
        error?.response?.data?.key?.includes('malware') || false;
      if (backendValidationError && malwareError) {
        showErrorToast(
          t(`common:error.malware.errorTitle`),
          error?.response?.data?.non_field_errors[0],
          320_000
        );
      } else if (backendValidationError) {
        showErrorToast(
          t(`common:error.generic.label`),
          `${error?.response?.data?.non_field_errors[0]}. ${t(
            'common:error.attachments.malformed'
          )}`,
          30_000
        );
      }
    } else if (isRemovingError) {
      showErrorToast(
        t(`common:delete.errorTitle`),
        t(`common:delete.errorMessage`)
      );
    }
  }, [isRemovingError, error, t]);

  const handleOpenFile = React.useCallback(
    (file: BenefitAttachment) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      window.open(file.attachmentFile, '_blank')?.focus(),
    []
  );

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
    handleOpenFile,
  };
};

export { useAttachmentsList };
