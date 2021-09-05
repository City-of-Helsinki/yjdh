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
  handleStepChange: (step: number) => void;
  translationsBase: string;
};

const useApplicationFormStep4 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections';
  const { applicationTempData, setApplicationTempData } = React.useContext(
    ApplicationContext
  );
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(3);

  const {
    mutate: updateApplicationStep4,
    error: updateApplicationErrorStep4,
    isSuccess: isApplicationUpdatedStep4,
  } = useUpdateApplicationQuery();

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep4) {
      hdsToast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep4]);

  useEffect(() => {
    if (isApplicationUpdatedStep4) {
      setApplicationTempData({ ...applicationTempData, currentStep: step });
    }
  }, [
    isApplicationUpdatedStep4,
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

  const handleNext = (): void => handleStepChange(5);

  const handleBack = (): void => handleStepChange(3);

  return {
    t,
    handleNext,
    handleBack,
    handleStepChange,
    translationsBase,
  };
};

export { useApplicationFormStep4 };
