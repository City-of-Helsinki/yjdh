// import { APPLICATION_STATUSES } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
// import useCreateApplicationQuery from 'benefit/applicant/hooks/useCreateApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect } from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import { IndexType, toCamelKeys } from 'shared/utils/object.utils';

type ExtendedComponentProps = {
  t: TFunction;
  handleSubmit: () => void;
  handleBack: () => void;
  steps: StepProps[];
  currentStep: number;
  hasNext: boolean;
  hasBack: boolean;
};

const usePageContent = (): ExtendedComponentProps => {
  const {
    query: { id },
  } = useRouter();
  const { t } = useTranslation();
  const { currentStep, setCurrentStep, setApplication } = React.useContext(
    ApplicationContext
  );

  /* const {
    mutate: createApplication,
    error: createApplicationError,
  } = useCreateApplicationQuery(); */

  const { data } = useApplicationQuery(id?.toString() || '');

  // '495d89a4-560d-449a-beb7-858cc90360aa'

  useEffect(() => {
    if (data) {
      setApplication(
        toCamelKeys((data as unknown) as IndexType) as Application
      );
    }
  }, [data, setApplication]);

  const steps = React.useMemo((): StepProps[] => {
    const applicationSteps: string[] = [
      'company',
      'hired',
      'attachments',
      'summary',
      'credentials',
      'send',
    ];
    return applicationSteps.map((step) => ({
      title: t(`common:applications.steps.${step}`),
    }));
  }, [t]);

  const hasNext = currentStep < steps.length;

  const hasBack = currentStep > 1;

  const handleSubmit = (): void => {
    // createApplication({ status: APPLICATION_STATUSES.INFO_REQUIRED });
    const nextStep = currentStep + 1;
    if (nextStep <= steps.length) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = (): void => setCurrentStep(currentStep - 1);

  return {
    t,
    steps,
    currentStep,
    hasNext,
    hasBack,
    handleSubmit,
    handleBack,
  };
};

export { usePageContent };
