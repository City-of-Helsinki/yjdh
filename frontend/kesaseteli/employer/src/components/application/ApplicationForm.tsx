import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useResetApplicationFormValues from 'kesaseteli/employer/hooks/application/useResetApplicationFormValues';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Toast from 'shared/components/toast/Toast';
import Application from 'shared/types/application-form-data';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const ApplicationForm = ({ title, children }: Props): JSX.Element => {
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
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:application.common_error'),
        text: errorMessage,
      });
    }
  }, [t, errorMessage]);

  return (
    <FormProvider {...methods}>
      <form aria-label={title}>{children}</form>
    </FormProvider>
  );
};
ApplicationForm.defaultProps = {
  title: undefined,
};

export default ApplicationForm;
