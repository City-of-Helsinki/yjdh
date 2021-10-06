import useFormActions from 'benefit/applicant/hooks/useFormActions';
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
  handleSave: () => void;
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

  const { onNext, onSave, onBack } = useFormActions(application, 4);

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep4) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
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

  const handleNext = (): void => onNext(application);

  const handleSave = (): void => onSave(application);

  return {
    t,
    handleNext,
    handleSave,
    handleBack: onBack,
    handleStepChange,
    translationsBase,
  };
};

export { useApplicationFormStep4 };
