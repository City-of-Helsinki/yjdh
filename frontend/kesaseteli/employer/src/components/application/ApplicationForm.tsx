import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useResetApplicationFormValues from 'kesaseteli/employer/hooks/application/useResetApplicationFormValues';
import { getStepNumber } from 'kesaseteli/employer/utils/application-wizard.utils';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Toast from 'shared/components/toast/Toast';
import useSetQueryParam from 'shared/hooks/useSetQueryParam';
import useWizard from 'shared/hooks/useWizard';
import Application from 'shared/types/employer-application';

type Props = {
  stepTitle: string;
  children: React.ReactNode;
};

const ApplicationForm = ({ stepTitle, children }: Props): JSX.Element => {
  const { activeStep } = useWizard();
  const currentStep = getStepNumber(activeStep + 1);
  useSetQueryParam('step', String(currentStep));

  const { t } = useTranslation();
  const { loadingError, updatingError } = useApplicationApi();
  const errorMessage = (loadingError || updatingError)?.message;
  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });
  useResetApplicationFormValues(methods);

  React.useEffect(() => {
    if (errorMessage) {
      Toast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:application.common_error'),
        text: errorMessage,
      });
    }
  }, [t, errorMessage]);

  return (
    <FormProvider {...methods}>
      <form aria-label={stepTitle}>{children}</form>
    </FormProvider>
  );
};

export default ApplicationForm;
