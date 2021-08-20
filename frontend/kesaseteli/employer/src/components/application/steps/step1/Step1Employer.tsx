import ActionButtons from 'kesaseteli/employer/components/application/ActionButtons';
import ApplicationStepForm from 'kesaseteli/employer/components/application/ApplicationStepForm';
import CompanyInfoGrid from 'kesaseteli/employer/components/companyInfo/CompanyInfoGrid';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import type Application from 'kesaseteli/employer/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $TextInput } from './Step1Employer.sc';

const Step1Employer: React.FC = () => {

  const { t } = useTranslation();
  const {
    updateApplication,
  } = useApplicationApi();
  const onSubmit = (draftApplication: Application): void =>
    updateApplication(draftApplication);

  return (
    <ApplicationStepForm title={t('common:application.step1.header')}>
      <CompanyInfoGrid />
      <$TextInput
        id="invoicer_name"
        validation={{ required: true, maxLength: 256 }}
      />
      <$TextInput
        id="invoicer_email"
        validation={{
          required: true,
          maxLength: 254,
          // eslint-disable-next-line security/detect-unsafe-regex
          pattern: /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/,
        }}
      />
      <$TextInput
        id="invoicer_phone_number"
        validation={{ required: true, maxLength: 64 }}
      />
      <ActionButtons
        onSubmit={onSubmit}
      />
    </ApplicationStepForm>
  );
};

export default Step1Employer;
