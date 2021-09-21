import hdsToast from 'benefit/applicant/components/toast/Toast';
import { BENEFIT_TYPES } from 'benefit/applicant/constants';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
  Attachment,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { useEffect } from 'react';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  benefitType: BENEFIT_TYPES | string | undefined;
  apprenticeshipProgram: boolean;
  showSubsidyMessage: boolean;
  handleNext: () => void;
  handleBack: () => void;
  attachments: Attachment[];
};

const useApplicationFormStep3 = (
  application: Application
): ExtendedComponentProps => {
  const { t } = useTranslation();

  const { mutate: updateApplicationStep3, error: updateApplicationErrorStep3 } =
    useUpdateApplicationQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep3) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep3]);

  const handleStepChange = (nextStep: number): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        applicationStep: getApplicationStepString(nextStep),
      },
      { deep: true }
    );
    updateApplicationStep3(currentApplicationData);
  };

  const handleNext = (): void => handleStepChange(4);

  const handleBack = (): void => handleStepChange(2);

  return {
    handleNext,
    handleBack,
    benefitType: application?.benefitType,
    apprenticeshipProgram: Boolean(application?.apprenticeshipProgram),
    showSubsidyMessage: Boolean(
      application?.paySubsidyPercent && application?.additionalPaySubsidyPercent
    ),
    attachments: application.attachments || [],
  };
};

export { useApplicationFormStep3 };
