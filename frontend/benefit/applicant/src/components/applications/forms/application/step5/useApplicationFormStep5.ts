import { APPLICATION_STATUSES, ROUTES } from 'benefit/applicant/constants';
import AppContext from 'benefit/applicant/context/AppContext';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import useUpdateApplicationQuery from 'benefit/applicant/hooks/useUpdateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import {
  Application,
  ApplicationData,
} from 'benefit/applicant/types/application';
import {
  getApplicantFullName,
  getApplicationStepString,
} from 'benefit/applicant/utils/common';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useContext, useEffect } from 'react';
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
  const router = useRouter();

  const { setSubmittedApplication, submittedApplication } =
    useContext(AppContext);

  const {
    mutate: updateApplicationStep5,
    error: updateApplicationErrorStep5,
    isSuccess: isApplicationUpdatedStep5,
  } = useUpdateApplicationQuery();

  const isSubmit = !isEmpty(application?.applicantTermsApproval);

  useEffect(() => {
    if (
      isApplicationUpdatedStep5 &&
      application.status === APPLICATION_STATUSES.RECEIVED
    ) {
      setSubmittedApplication({
        applicantName: getApplicantFullName(
          application.employee?.firstName,
          application.employee?.lastName
        ),
        applicationNumber: application.applicationNumber || 0,
      });
    }
  }, [isApplicationUpdatedStep5, application, setSubmittedApplication]);

  useEffect(() => {
    if (submittedApplication) {
      void router.push(ROUTES.HOME);
    }
  }, [router, submittedApplication]);

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
