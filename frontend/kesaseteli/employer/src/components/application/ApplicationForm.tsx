import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import usePersistFormValuesEffect from 'kesaseteli/employer/hooks/application/usePersistFormValuesEffect';
import useResetApplicationFormValuesEffect from 'kesaseteli/employer/hooks/application/useResetApplicationFormValuesEffect';
import useSaveCurrentStepEffect from 'kesaseteli/employer/hooks/wizard/useSaveCurrentStepEffect';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLeaveConfirm from 'shared/hooks/useLeaveConfirm';
import Application from 'shared/types/application-form-data';

type Props = {
  title?: string;
  children: React.ReactNode;
  step: number;
};

const ApplicationForm: React.FC<Props> = ({ title, step, children }: Props) => {
  const { t } = useTranslation();
  const { applicationQuery, applicationId } = useApplicationApi();

  const methods = useForm<Application>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const hasDirtyDraftApplication =
    methods.formState.isDirty &&
    Boolean(applicationId) &&
    applicationQuery.data?.status === 'draft';

  useLeaveConfirm(
    hasDirtyDraftApplication,
    t('common:application.buttons.leave_confirmation')
  );

  useResetApplicationFormValuesEffect(methods);
  usePersistFormValuesEffect(methods);

  useSaveCurrentStepEffect(step);

  if (applicationQuery.isSuccess) {
    return (
      <FormProvider {...methods}>
        <form id="employer-application-form" aria-label={title}>
          {children}
        </form>
      </FormProvider>
    );
  }
  return <PageLoadingSpinner />;
};

export default ApplicationForm;
