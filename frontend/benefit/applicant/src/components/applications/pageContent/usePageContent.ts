import {
  APPLICATION_INITIAL_VALUES,
  DEFAULT_APPLICATION_STEP,
} from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { isApplicationEditable } from 'benefit/applicant/utils/applications';
import { getApplicationStepFromString } from 'benefit/applicant/utils/common';
import { Application } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { StepperProps, StepState } from 'hds-react';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { stringToFloatValue } from 'shared/utils/string.utils';

type ExtendedComponentProps = {
  t: TFunction;
  steps: StepperProps['steps'];
  currentStep: number;
  application: Application;
  isReadOnly: boolean;
  id: string | string[] | undefined;
  isError: boolean;
  isLoading: boolean;
  isSubmittedApplication: boolean;
  setIsSubmittedApplication: React.Dispatch<React.SetStateAction<boolean>>;
};

const isApplicationLoaded = (id: number | string, status: string): boolean =>
  id && status !== 'idle' && status !== 'loading';

// eslint-disable-next-line sonarjs/cognitive-complexity
const usePageContent = (): ExtendedComponentProps => {
  const router = useRouter();
  const id = router?.query?.id?.toString() ?? '';
  const isSubmittedQueryParam = !!router?.query?.isSubmitted;
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

  const isReadOnly = !isApplicationEditable(existingApplication?.status);

  useEffect(() => {
    if (isApplicationLoaded(id, existingApplicationStatus)) {
      setIsLoading(false);
    }
  }, [existingApplicationStatus, id, existingApplication]);

  useEffect(() => {
    if (
      id &&
      !isLoading &&
      !isApplicationLoaded(id, existingApplicationStatus)
    ) {
      setIsLoading(true);
    }
  }, [existingApplicationStatus, id, isLoading]);

  useEffect(() => {
    if (router.isReady && !router.query.id) {
      setIsLoading(false);
    }
    setIsSubmittedApplication(isSubmittedQueryParam);
  }, [router, isSubmittedQueryParam]);

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

  const currentStep = getApplicationStepFromString(
    application.applicationStep || DEFAULT_APPLICATION_STEP
  );

  const steps = React.useMemo((): StepperProps['steps'] => {
    const applicationSteps: string[] = [
      'employer',
      'hired',
      'attachments',
      'credentials',
      'summary',
      'send',
    ];
    return applicationSteps.map((step, index) => ({
      label: t(`common:applications.steps.${step}`),
      state: currentStep > index ? StepState.available : StepState.disabled,
    }));
  }, [t, currentStep]);

  return {
    t,
    id,
    steps,
    currentStep,
    application,
    isLoading,
    isError: Boolean(id && existingApplicationError),
    isReadOnly,
    setIsSubmittedApplication,
    isSubmittedApplication,
  };
};

export { usePageContent };
