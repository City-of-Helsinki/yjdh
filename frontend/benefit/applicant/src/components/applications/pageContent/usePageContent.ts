import { DEFAULT_APPLICATION } from 'benefit/applicant/constants';
import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import useApplicationTemplateQuery from 'benefit/applicant/hooks/useApplicationTemplateQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import camelcaseKeys from 'camelcase-keys';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React from 'react';
import { StepProps } from 'shared/components/stepper/Step';

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
  const { applicationTempData } = React.useContext(ApplicationContext);
  // query param used in edit mode. id from context used for updating newly created application
  const existingApplicationId = id?.toString() || applicationTempData?.id;
  const { data: existingApplication } = useApplicationQuery(
    existingApplicationId
  );
  const { data: applicationTemplate } = useApplicationTemplateQuery(
    existingApplicationId
  );
  let application: Application = {};
  const defaultApplication = DEFAULT_APPLICATION as Application;

  // if no id, get the application template date
  if (existingApplication || (!existingApplicationId && applicationTemplate)) {
    // transform application data to camel case
    application = camelcaseKeys(existingApplication || {}, {
      deep: true,
    }) as Application;
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
    currentStep: applicationTempData.currentStep,
    application: !isEmpty(application)
      ? { ...defaultApplication, ...application }
      : defaultApplication,
  };
};

export { usePageContent };
