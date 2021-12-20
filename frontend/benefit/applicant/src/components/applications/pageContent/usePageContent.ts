import {
  APPLICATION_INITIAL_VALUES,
  DEFAULT_APPLICATION_STEP,
} from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { getApplicationStepFromString } from 'benefit/common/utils/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
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
  const id = router?.query?.id?.toString() ?? '';
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  // query param used in edit mode. id from context used for updating newly created application
  const {
    status: existingApplicationStatus,
    data: existingApplication,
    error: existingApplicationError,
  } = useApplicationQuery(id);

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

  const application: Application = existingApplication
    ? camelcaseKeys(existingApplication, {
        deep: true,
      })
    : APPLICATION_INITIAL_VALUES;

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
    application,
    isLoading,
    isError: Boolean(id && existingApplicationError),
  };
};

export { usePageContent };
