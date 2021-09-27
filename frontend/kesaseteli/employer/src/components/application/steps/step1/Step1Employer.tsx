import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import EmployerForm from 'kesaseteli/employer/components/application/steps/step1/EmployerForm';
import useSetCurrentStep from 'kesaseteli/employer/hooks/application/useSetCurrentStep';
import { useTranslation } from 'next-i18next';
import React from 'react';

const Step1Employer: React.FC = () => {
  const { t } = useTranslation();
  useSetCurrentStep();
  return (
    <ApplicationForm title={t('common:application.step1.header')}>
      <EmployerForm />
      <ActionButtons />
    </ApplicationForm>
  );
};

export default Step1Employer;
