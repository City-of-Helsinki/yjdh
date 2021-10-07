import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import { TFunction } from 'next-i18next';
import { useEffect } from 'react';
import hdsToast from 'shared/components/toast/Toast';
import snakecaseKeys from 'snakecase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  handleNext: () => void;
  handleBack: () => void;
  handleStepChange: (step: number) => void;
  translationsBase: string;
};

const useApplicationFormStep5 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();

  const { mutate: updateApplicationStep5, error: updateApplicationErrorStep5 } =
    useUpdateApplicationQuery();

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

  const handleStepChange = (nextStep: number): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        applicationStep: getApplicationStepString(nextStep),
      },
      { deep: true }
    );
    updateApplicationStep5(currentApplicationData);
  };

  const handleNext = (): void => handleStepChange(6);

  const handleBack = (): void => handleStepChange(4);

  return {
    t,
    handleNext,
    handleBack,
    handleStepChange,
    translationsBase,
  };
};

export { useApplicationFormStep5 };
