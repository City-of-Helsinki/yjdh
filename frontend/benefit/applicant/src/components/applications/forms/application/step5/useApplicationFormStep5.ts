import hdsToast from 'benefit/applicant/components/toast/Toast';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  handleNext: () => void;
  handleBack: () => void;
  translationsBase: string;
};

const useApplicationFormStep5 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections.credentials.sections';
  const { applicationTempData, setApplicationTempData } =
    React.useContext(ApplicationContext);
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(3);

  const {
    mutate: updateApplicationStep4,
    error: updateApplicationErrorStep5,
    isSuccess: isApplicationUpdatedStep5,
  } = useUpdateApplicationQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep5) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep5]);

  useEffect(() => {
    if (isApplicationUpdatedStep5) {
      setApplicationTempData({ ...applicationTempData, currentStep: step });
    }
  }, [
    isApplicationUpdatedStep5,
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
    updateApplicationStep4(currentApplicationData);
  };

  const handleNext = (): void => handleStepChange(6);

  const handleBack = (): void => handleStepChange(4);

  return {
    t,
    handleNext,
    handleBack,
    translationsBase,
  };
};

export { useApplicationFormStep5 };
