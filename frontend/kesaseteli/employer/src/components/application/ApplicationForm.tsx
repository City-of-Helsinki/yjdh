import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useResetApplicationFormValuesEffect from 'kesaseteli/employer/hooks/application/useResetApplicationFormValuesEffect';
import useSaveCurrentStepEffect from 'kesaseteli/employer/hooks/wizard/useSaveCurrentStepEffect';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import Application from 'shared/types/application-form-data';

type Props = {
  title?: string;
  children: React.ReactNode;
  step: number;
};

const ApplicationForm: React.FC<Props> = ({ title, step, children }: Props) => {
  const { applicationQuery } = useApplicationApi();

  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });
  useResetApplicationFormValuesEffect(methods);

  useSaveCurrentStepEffect(step);

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
