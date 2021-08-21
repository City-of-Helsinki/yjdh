import { Notification } from 'hds-react';
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
import FormSection from 'shared/components/forms/section/FormSection';
import useSetQueryParam from 'shared/hooks/useSetQueryParam';
import useWizard from 'shared/hooks/useWizard';
import Application from 'shared/types/employer-application';

export type ApplicationFormProps = {
  title: string;
  children: React.ReactNode;
};

const ApplicationStepForm = ({
  title,
  children,
}: ApplicationFormProps): JSX.Element => {
  const { activeStep } = useWizard();
  const currentStep = getStepNumber(activeStep + 1);
  useSetQueryParam('step', String(currentStep));

  const { t } = useTranslation();
  const translateLabel = (key: keyof Application): string =>
    key ? t(`common:application.step1.form.${key}`) : key;
  const translateError = (key: keyof Application): string =>
    key ? t(`common:application.step1.form.errors.${key}`) : key;

  const { isLoading, loadingError, updatingError } = useApplicationApi();
  const errorMessage = (loadingError || updatingError)?.message;
  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  useSetFormDefaultValues(methods);

  if (errorMessage)
    return (
      <Notification
        label={`${t(`common:application.common_error`)} ${errorMessage}`}
        type="error"
      />
    );

  const context = {
    translateLabel,
    translateError,
    ...methods,
  };
  setApplicationFormContext(context);

  const FormContextProvider = getApplicationFormContext().Provider;

  return (
    <FormSection header={title} loading={isLoading}>
      <FormContextProvider value={context}>
        <form aria-label={title}>{children}</form>
      </FormContextProvider>
    </FormSection>
  );
};

export default ApplicationStepForm;
