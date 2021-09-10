import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import StepForm from 'kesaseteli/employer/components/application/StepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/employer-application';

const Step3Summary: React.FC = () => {
  const { t } = useTranslation();
  const { application, sendApplication } = useApplicationApi();

  const onSubmit = (draftApplication: Application): void =>
    sendApplication(draftApplication);

  const stepTitle = t('common:application.step3.header');
  return (
    <StepForm stepTitle={stepTitle}>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step3.tooltip')}
      >
        Yhteenveto: <p />
        {JSON.stringify(application, null, 2)}
        <ActionButtons onSubmit={onSubmit} />
      </FormSection>
    </StepForm>
  );
};
export default Step3Summary;
