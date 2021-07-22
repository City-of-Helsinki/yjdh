import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit/applicant/types/application';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect } from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import { IndexType, toCamelKeys } from 'shared/utils/object.utils';

type ExtendedComponentProps = {
  t: TFunction;
  steps: StepProps[];
  currentStep: number;
};

const usePageContent = (): ExtendedComponentProps => {
  const {
    query: { id },
  } = useRouter();
  const { t } = useTranslation();
  const { setApplication, application } = React.useContext(ApplicationContext);

  const { data } = useApplicationQuery(id?.toString() || '');

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

  return {
    t,
    steps,
    currentStep: application?.currentStep || 1,
  };
};

export { usePageContent };
