import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import EmploymentAccordions from 'kesaseteli/employer/components/application/steps/step2/accordions/EmploymentAccordions';
import { useTranslation } from 'next-i18next';
import React from 'react';

const Step2Employments: React.FC = () => {
  const { t } = useTranslation();
  const title = t('common:application.step2.header');
  return (
    <ApplicationForm title={title} step={2}>
      <EmploymentAccordions />
      <ActionButtons />
    </ApplicationForm>
  );
};
export default Step2Employments;
