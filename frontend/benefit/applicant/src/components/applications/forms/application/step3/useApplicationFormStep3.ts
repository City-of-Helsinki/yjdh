import hdsToast from 'benefit/applicant/components/toast/Toast';
import { BENEFIT_TYPES } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import React, { useEffect, useState } from 'react';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  benefitType: BENEFIT_TYPES | string | undefined;
  apprenticeshipProgram: boolean;
  showSubsidyMessage: boolean;
  handleNext: () => void;
  handleBack: () => void;
};

const useApplicationFormStep3 = (
  application: Application
): ExtendedComponentProps => {
  const { applicationTempData, setApplicationTempData } = React.useContext(
    ApplicationContext
  );
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(3);

  const {
    mutate: updateApplicationStep3,
    error: updateApplicationErrorStep3,
    isSuccess: isApplicationUpdatedStep3,
  } = useUpdateApplicationQuery();

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

  useEffect(() => {
    if (isApplicationUpdatedStep3) {
      setApplicationTempData({ ...applicationTempData, currentStep: step });
    }
  }, [
    isApplicationUpdatedStep3,
    applicationTempData,
    step,
    setApplicationTempData,
  ]);

  const handleStepChange = (nextStep: number): void => {
    setStep(nextStep);
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
  };
};

export { useApplicationFormStep3 };
