import {
  APPLICATION_INITIAL_VALUES,
  DEFAULT_APPLICATION_STEP,
} from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { getApplicationStepFromString } from 'benefit/applicant/utils/common';
import { Application } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import { stringToFloatValue } from 'shared/utils/string.utils';

type ExtendedComponentProps = {
  t: TFunction;
  steps: StepProps[];
  currentStep: number;
  application: Application;
  isReadOnly: string | string[] | undefined;
  id: string | string[] | undefined;
  isError: boolean;
  isLoading: boolean;
  isSubmittedApplication: boolean;
  handleSubmit: () => void;
};

const usePageContent = (): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id?.toString() ?? '';
  const isReadOnly = router?.query?.isReadOnly?.toString() ?? '';
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmittedApplication, setIsSubmittedApplication] =
    useState<boolean>(false);

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
    ? camelcaseKeys(
        {
          ...existingApplication,
          calculation: existingApplication.calculation
            ? {
                ...existingApplication.calculation,
                monthly_pay: String(
                  stringToFloatValue(
                    existingApplication.calculation.monthly_pay
                  )
                ),
                other_expenses: String(
                  stringToFloatValue(
                    existingApplication.calculation.other_expenses
                  )
                ),
                vacation_money: String(
                  stringToFloatValue(
                    existingApplication.calculation.vacation_money
                  )
                ),
                override_monthly_benefit_amount: String(
                  stringToFloatValue(
                    existingApplication.calculation
                      .override_monthly_benefit_amount
                  )
                ),
              }
            : undefined,
        },
        {
          deep: true,
        }
      )
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

  const handleSubmit = (): void => setIsSubmittedApplication(true);

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
    isReadOnly,
    isSubmittedApplication,
    handleSubmit,
  };
};

export { usePageContent };
