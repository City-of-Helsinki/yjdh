import { APPLICATION_STATUSES } from 'benefit/applicant/constants';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import { getApplicationStepString } from 'benefit/applicant/utils/common';
import isEmpty from 'lodash/isEmpty';
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
  isSubmit: boolean;
};

const useApplicationFormStep5 = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();

  const { mutate: updateApplicationStep5, error: updateApplicationErrorStep5 } =
    useUpdateApplicationQuery();

  const isSubmit = !isEmpty(application?.applicantTermsApproval);

  useEffect(() => {
    // todo:custom error messages
    if (updateApplicationErrorStep5) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
      });
    }
  }, [t, updateApplicationErrorStep5]);

  const { onNext, onSave, onBack } = useFormActions(application, 5);

  const handleStepChange = (nextStep: number): void => {
    let submitFields = {};
    submitFields = isSubmit
      ? {
          approveTerms: {
            terms: application?.applicantTermsInEffect?.id,
            selectedApplicantConsents:
              application?.applicantTermsInEffect?.applicantConsents.map(
                (consent) => consent.id
              ),
          },
          status: APPLICATION_STATUSES.RECEIVED,
        }
      : { applicationStep: getApplicationStepString(nextStep) };
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        ...submitFields,
      },
      { deep: true }
    );
    updateApplicationStep5(currentApplicationData);
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
    isSubmit,
  };
};

export { useApplicationFormStep5 };
