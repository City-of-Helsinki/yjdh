import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import useRemoveAttachmentQuery from 'benefit/applicant/hooks/useRemoveAttachmentQuery';
import useUploadAttachmentQuery from 'benefit/applicant/hooks/useUploadAttachmentQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { TFunction } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import hdsToast from 'shared/components/toast/Toast';
import { BenefitAttachment } from 'shared/types/attachment';

type ExtendedComponentProps = {
  t: TFunction;
  handleNext: () => void;
  handleSave: () => void;
  handleBack: () => void;
  handleRemoveAttachment: (attachmentId: string) => void;
  handleUploadAttachment: (attachment: FormData) => void;
  translationsBase: string;
  attachment: BenefitAttachment | undefined;
  isRemoving: boolean;
  isUploading: boolean;
};

const useApplicationFormStep4 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections.credentials.sections';
  const { t } = useTranslation();

  const { onNext, onSave, onBack } = useFormActions(application);

  const {
    mutate: uploadAttachment,
    isLoading: isUploading,
    isError: isUploadingError,
  } = useUploadAttachmentQuery();

  useEffect(() => {
    if (isUploadingError) {
      showErrorToast(
        t(`common:upload.errorTitle`),
        t(`common:upload.errorMessage`)
      );
    }
  }, [isUploadingError, t]);

  const {
    mutate: removeAttachment,
    isLoading: isRemoving,
    isError: isRemovingError,
  } = useRemoveAttachmentQuery();

  useEffect(() => {
    // todo:custom error messages
    if (isRemovingError) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, isRemovingError]);

  const handleNext = (): void => onNext(application);
  const handleSave = (): void => onSave(application);

  const getEmployeeConsentAttachment = (): BenefitAttachment | undefined =>
    application.attachments?.find(
      (attachment) =>
        attachment.attachmentType === ATTACHMENT_TYPES.EMPLOYEE_CONSENT
    );

  const handleRemoveAttachment = (attachmentId: string): void =>
    removeAttachment({
      applicationId: application.id || '',
      attachmentId,
    });

  const handleUploadAttachment = (attachment: FormData): void =>
    uploadAttachment({
      applicationId: application.id || '',
      data: attachment,
    });

  return {
    t,
    handleNext,
    handleSave,
    handleBack: onBack,
    handleUploadAttachment,
    handleRemoveAttachment,
    isRemoving,
    isUploading,
    translationsBase,
    attachment: getEmployeeConsentAttachment(),
  };
};

export { useApplicationFormStep4 };
