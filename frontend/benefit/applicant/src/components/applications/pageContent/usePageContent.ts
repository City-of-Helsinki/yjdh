import { DEFAULT_APPLICATION } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import { IndexType, toCamelKeys } from 'shared/utils/object.utils';

type ExtendedComponentProps = {
  t: TFunction;
  steps: StepProps[];
  currentStep: number;
  application: Application;
};

const usePageContent = (): ExtendedComponentProps => {
  const {
    query: { id },
  } = useRouter();
  const { t } = useTranslation();
  const { applicationId, currentStep } = React.useContext(ApplicationContext);
  // query param used in edit mode. id from context used for updating newly created application
  const { data } = useApplicationQuery(id?.toString() || applicationId);
  let application: Application = {};

  if (data) {
    // transform application data to camel case
    application = toCamelKeys((data as unknown) as IndexType) as Application;
  }

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

  return {
    t,
    steps,
    currentStep,
    application: !isEmpty(application)
      ? application
      : (DEFAULT_APPLICATION as Application),
  };
};

export { usePageContent };
