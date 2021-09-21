import hdsToast from 'benefit/applicant/components/toast/Toast';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import useRemoveAttachmentQuery from 'benefit/applicant/hooks/useRemoveAttachmentQuery';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
  Attachment,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { TFunction } from 'next-i18next';
import { useEffect } from 'react';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  handleNext: () => void;
  handleBack: () => void;
  translationsBase: string;
  attachment: Attachment | null;
  isRemoving: boolean;
  handleRemoveAttachment: (attachmentId: string) => void;
};

const useApplicationFormStep5 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections.credentials.sections';
  const { t } = useTranslation();

  const { mutate: updateApplicationStep4, error: updateApplicationErrorStep5 } =
    useUpdateApplicationQuery();

  const {
    mutate: removeAttachment,
    isLoading: isRemoving,
    isError: isRemovingError,
  } = useRemoveAttachmentQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep5 || isRemovingError) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep5, isRemovingError]);

  const handleStepChange = (nextStep: number): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        applicationStep: getApplicationStepString(nextStep),
      },
      { deep: true }
    );
    updateApplicationStep4(currentApplicationData);
  };

  const handleNext = (): void => handleStepChange(6);

  const handleBack = (): void => handleStepChange(4);

  const getEmployeeConsentAttachment = (): Attachment | null => {
    const consentArray = application.attachments?.filter(
      (attachment) =>
        attachment.attachmentType === ATTACHMENT_TYPES.EMPLOYEE_CONSENT
    );
    return consentArray?.length === 1 ? consentArray[0] : null;
  };

  const handleRemoveAttachment = (attachmentId: string): void => {
    removeAttachment({
      applicationId: application.id || '',
      attachmentId,
    });
  };

  return {
    t,
    handleNext,
    handleBack,
    isRemoving,
    handleRemoveAttachment,
    translationsBase,
    attachment: getEmployeeConsentAttachment(),
  };
};

export { useApplicationFormStep5 };
