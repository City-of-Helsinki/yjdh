import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import CompanyInfoGrid from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

import { $EmployerBasicInfo } from './Step1Employer.sc';

const Step1Employer: React.FC = () => {
  const { t } = useTranslation();
  const stepTitle = t('common:application.step1.header');
  return (
    <ApplicationForm stepTitle={stepTitle}>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step1.tooltip')}
      >
        <CompanyInfoGrid />
      </FormSection>
      <FormSection>
        <$EmployerBasicInfo>
          <TextInput
            id="invoicer_name"
            validation={{ required: true, maxLength: 256 }}
          />
          <TextInput
            id="invoicer_email"
            validation={{
              required: true,
              maxLength: 254, // eslint-disable-next-line security/detect-unsafe-regex
              pattern: /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/,
            }}
          />
          <TextInput
            id="invoicer_phone_number"
            validation={{ required: true, maxLength: 64 }}
          />
        </$EmployerBasicInfo>
      </FormSection>
      <ActionButtons onNext="updateApplication" />
    </ApplicationForm>
  );
};

export default Step1Employer;
