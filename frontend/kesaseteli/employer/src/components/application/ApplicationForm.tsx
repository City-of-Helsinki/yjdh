import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useResetApplicationFormValues from 'kesaseteli/employer/hooks/application/useResetApplicationFormValues';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import Toast from 'shared/components/toast/Toast';
import Application from 'shared/types/application-form-data';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const ApplicationForm: React.FC<Props> = ({ title, children }: Props) => {
  const { t } = useTranslation();
  const { applicationQuery, updateApplicationQuery } = useApplicationApi();
  const errorMessage = (applicationQuery.error || updateApplicationQuery.error)
    ?.message;
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

  if (applicationQuery.isSuccess) {
    return (
      <FormProvider {...methods}>
        <form aria-label={title}>{children}</form>
      </FormProvider>
    );
  }
  return <PageLoadingSpinner />;
};
ApplicationForm.defaultProps = {
  title: undefined,
};

export default ApplicationForm;
