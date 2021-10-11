import {
  APPLICATION_INITIAL_VALUES,
  DEFAULT_APPLICATION_STEP,
} from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import useApplicationTemplateQuery from 'benefit/applicant/hooks/useApplicationTemplateQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { getApplicationStepFromString } from 'benefit/applicant/utils/common';
import camelcaseKeys from 'camelcase-keys';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import hdsToast from 'shared/components/toast/Toast';

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
  const id = router?.query?.id?.toString() ?? '';
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  // query param used in edit mode. id from context used for updating newly created application
  const {
    status: existingApplicationStatus,
    data: existingApplication,
    error: existingApplicationError,
  } = useApplicationQuery(id);
  const { data: applicationTemplate, error: applicationTemplateError } =
    useApplicationTemplateQuery(id);

  useEffect(() => {
    // todo:custom error messages
    if (applicationTemplateError) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: t('common:error.generic.text'),
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
  }, [existingApplicationStatus, id, existingApplication]);

  useEffect(() => {
    if (router.isReady && !router.query.id) {
      setIsLoading(false);
    }
  }, [router]);

  let application: Application = {};
  const defaultApplication: Application = APPLICATION_INITIAL_VALUES;

  // if no id, get the application template date
  if (existingApplication || (!id && applicationTemplate)) {
    // transform application data to camel case
    application = camelcaseKeys(
      existingApplication || applicationTemplate || {},
      {
        deep: true,
      }
    );
  }

  const steps = React.useMemo((): StepProps[] => {
    const applicationSteps: string[] = [
      'employer',
      'hired',
      'attachments',
      'credentials',
      'summary',
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
    currentStep: getApplicationStepFromString(
      application.applicationStep || DEFAULT_APPLICATION_STEP
    ),
    application: !isEmpty(application)
      ? { ...defaultApplication, ...application }
      : defaultApplication,
    isLoading,
    isError: Boolean(id && existingApplicationError),
  };
};

export { usePageContent };
