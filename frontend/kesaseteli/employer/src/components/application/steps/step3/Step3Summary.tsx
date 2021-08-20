import ActionButtons from 'kesaseteli/employer/components/application/ActionButtons';
import ApplicationStepForm from 'kesaseteli/employer/components/application/ApplicationStepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import Application from 'kesaseteli/employer/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';

const Step3Summary: React.FC = () => {

  const { t } = useTranslation();
  const {
    application,
    sendApplication,
  } = useApplicationApi();

  const onSubmit = (draftApplication: Application): void =>
    sendApplication(draftApplication);

  return (
    <ApplicationStepForm title={t('common:application.step3.header')}>
      Yhteenveto: <p/>{JSON.stringify(application, null, 2)}
      <ActionButtons
        onSubmit={onSubmit}
      />
    </ApplicationStepForm>
  );
};
export default Step3Summary;
