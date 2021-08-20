import ActionButtons from 'kesaseteli/employer/components/application/ActionButtons';
import ApplicationStepForm from 'kesaseteli/employer/components/application/ApplicationStepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import Application from 'kesaseteli/employer/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';

const Step2Employees: React.FC = () => {

  const { t } = useTranslation();
  const {
    updateApplication,
  } = useApplicationApi();

  const onSubmit = (draftApplication: Application): void =>
    updateApplication(draftApplication);

  return (
    <ApplicationStepForm title={t('common:application.step2.header')}>
      Työntekijöiden kaavake....
      <ActionButtons
        onSubmit={onSubmit}
      />
    </ApplicationStepForm>
  );
};
export default Step2Employees;
