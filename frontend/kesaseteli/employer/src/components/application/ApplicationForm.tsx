import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useResetApplicationFormValues from 'kesaseteli/employer/hooks/application/useResetApplicationFormValues';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import Application from 'shared/types/application-form-data';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const ApplicationForm: React.FC<Props> = ({ title, children }: Props) => {
  const { applicationQuery } = useApplicationApi();

  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });
  useResetApplicationFormValues(methods);

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
