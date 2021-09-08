import CompanyInfo from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import StepForm from 'kesaseteli/employer/components/application/StepForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import EmployerApplication from 'shared/types/employer-application';

import { $EmployerBasicInfo } from './Step1Employer.sc';

const Step1Employer: React.FC = () => {
  const { t } = useTranslation();
  const { updateApplication } = useApplicationApi();

  const onSubmit = (draftApplication: EmployerApplication): void => {
    updateApplication(draftApplication);
  };
  const stepTitle = t('common:application.step1.header');
  return (
    <StepForm stepTitle={stepTitle}>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step1.tooltip')}
      >
        <CompanyInfo />
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
      <ActionButtons onSubmit={onSubmit} />
    </StepForm>
  );
};

export default Step1Employer;
