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
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { StepProps } from 'shared/components/stepper/Step';

type ExtendedComponentProps = {
  t: TFunction;
  steps: StepProps[];
  currentStep: number;
  application: Application;
  id: string | string[] | undefined;
  isError: boolean;
  isLoading: boolean;
};

const usePageContent = (): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id;
  const { t } = useTranslation();
  const { applicationTempData } = React.useContext(ApplicationContext);
  const [isLoading, setIsLoading] = useState(true);
  // query param used in edit mode. id from context used for updating newly created application
  const existingApplicationId = id?.toString() || applicationTempData?.id;
  const {
    status: existingApplicationStatus,
    data: existingApplication,
    error: existingApplicationError,
  } = useApplicationQuery(existingApplicationId);
  const {
    data: applicationTemplate,
    error: applicationTemplateError,
  } = useApplicationTemplateQuery(existingApplicationId);

  useEffect(() => {
    // todo:custom error messages
    if (applicationTemplateError) {
      toast(t('common:error.generic.text'), {
        position: 'top-right',
        type: 'error',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
      });
    }
  }, [t, applicationTemplateError]);

  useEffect(() => {
    if (
      id &&
      existingApplicationStatus !== 'idle' &&
      existingApplicationStatus !== 'loading'
    ) {
      setIsLoading(false);
    }
  }, [existingApplicationStatus, id]);

  useEffect(() => {
    if (router.isReady && !router.query.id) {
      setIsLoading(false);
    }
  }, [router]);

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
    id,
    steps,
    currentStep: applicationTempData.currentStep,
    application: !isEmpty(application)
      ? { ...defaultApplication, ...application }
      : defaultApplication,
    isLoading,
    isError: Boolean(id && existingApplicationError),
  };
};

export { usePageContent };
