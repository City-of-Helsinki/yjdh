import ApplicationActions from 'kesaseteli/employer/components/application/ApplicationActions';
import ApplicationStepForm from 'kesaseteli/employer/components/application/ApplicationStepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/employer-application';

const Step3Summary: React.FC = () => {

  const { t } = useTranslation();
  const {
    isLoading,
    application,
    sendApplication,
  } = useApplicationApi();

  const onSubmit = (draftApplication: Application): void =>
    sendApplication(draftApplication);

  const stepTitle = t('common:application.step3.header');
  return (
    <ApplicationStepForm stepTitle={stepTitle}>
      <FormSection header={stepTitle} loading={isLoading} tooltip={t('common:application.step3.tooltip')}>
      Yhteenveto: <p/>{JSON.stringify(application, null, 2)}
      <ApplicationActions
        onSubmit={onSubmit}
      />
      </FormSection>
    </ApplicationStepForm>
  );
};
export default Step3Summary;
