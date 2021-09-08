import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import EmploymentAccordions from 'kesaseteli/employer/components/application/steps/step2/EmploymentAccordions';
import { useTranslation } from 'next-i18next';
import React from 'react';

const Step2Employments: React.FC = () => {
  const { t } = useTranslation();
  const stepTitle = t('common:application.step2.header');
  return (
    <ApplicationForm stepTitle={stepTitle}>
      <EmploymentAccordions />
      <ActionButtons
        onNext="updateApplication"
      />
    </ApplicationForm>
  );
};
export default Step2Employments;
