import hdsToast from 'benefit/applicant/components/toast/Toast';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { TFunction } from 'next-i18next';
import { useEffect } from 'react';
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
  const { t } = useTranslation();

  const { mutate: updateApplicationStep4, error: updateApplicationErrorStep4 } =
    useUpdateApplicationQuery();

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
