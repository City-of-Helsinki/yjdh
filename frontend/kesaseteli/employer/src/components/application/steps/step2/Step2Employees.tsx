import ApplicationActions from 'kesaseteli/employer/components/application/ApplicationActions';
import ApplicationStepForm from 'kesaseteli/employer/components/application/ApplicationStepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/employer-application';

const Step2Employees: React.FC = () => {

  const { t } = useTranslation();
  const {
    updateApplication,
    isLoading
  } = useApplicationApi();

  const onSubmit = (draftApplication: Application): void =>
    updateApplication(draftApplication);

  const stepTitle = t('common:application.step2.header');
  return (
    <ApplicationStepForm stepTitle={stepTitle}>
      <FormSection header={stepTitle} loading={isLoading} tooltip={t('common:application.step2.tooltip')}>
      Työntekijöiden kaavake....
      <ApplicationActions
        onSubmit={onSubmit}
      />
      </FormSection>
    </ApplicationStepForm>
  );
};
export default Step2Employees;
