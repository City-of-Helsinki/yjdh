import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import StepForm from 'kesaseteli/employer/components/application/StepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/employer-application';

const Step2Employees: React.FC = () => {
  const { t } = useTranslation();
  const { updateApplication } = useApplicationApi();

  const onSubmit = (draftApplication: Application): void =>
    updateApplication(draftApplication);

  const stepTitle = t('common:application.step2.header');
  return (
    <StepForm stepTitle={stepTitle}>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step2.tooltip')}
      >
        Työntekijöiden kaavake....
        <ActionButtons onSubmit={onSubmit} />
      </FormSection>
    </StepForm>
  );
};
export default Step2Employees;
