import {
  getApplicationFormContext,
  setApplicationFormContext,
} from 'kesaseteli/employer/contexts/ApplicationFormContext';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useSetFormDefaultValues from 'kesaseteli/employer/hooks/application/useSetFormDefaultValues';
import { getStepNumber } from 'kesaseteli/employer/utils/application-wizard.utils';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useForm } from 'react-hook-form';
import useSetQueryParam from 'shared/hooks/useSetQueryParam';
import useShowToastIfError from 'shared/hooks/useShowToastIfError';
import useWizard from 'shared/hooks/useWizard';
import Application from 'shared/types/employer-application';

type Props = {
  stepTitle: string;
  children: React.ReactNode;
};

const StepForm = ({ stepTitle, children }: Props): JSX.Element => {
  const { activeStep } = useWizard();
  const currentStep = getStepNumber(activeStep + 1);

  const { t } = useTranslation();
  const translateLabel = (key: keyof Application): string =>
    key ? t(`common:application.step1.form.${key}`) : key;
  const translateError = (key: keyof Application): string =>
    key ? t(`common:application.step1.form.errors.${key}`) : key;

  const { loadingError, updatingError } = useApplicationApi();
  const errorMessage = (loadingError || updatingError)?.message;
  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  useSetQueryParam('step', String(currentStep));
  useShowToastIfError(errorMessage);
  useSetFormDefaultValues(methods);

  const context = {
    translateLabel,
    translateError,
    ...methods,
  };
  setApplicationFormContext(context);

  const FormContextProvider = getApplicationFormContext().Provider;

  return (
    <FormContextProvider value={context}>
      <form aria-label={stepTitle}>{children}</form>
    </FormContextProvider>
  );
};

export default StepForm;
