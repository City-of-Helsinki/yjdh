import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import CompanyInfoGrid from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { EMAIL_REGEX } from 'shared/constants';

const Step1Employer: React.FC = () => {
  const { t } = useTranslation();
  const stepTitle = t('common:application.step1.header');
  return (
    <ApplicationForm stepTitle={stepTitle}>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step1.tooltip')}
        withoutDivider
      />
      <CompanyInfoGrid />
      <FormSection columns={2}>
        <TextInput
          id="contact_person_name"
          validation={{ required: true, maxLength: 256 }}
        />
        <TextInput
          id="contact_person_email"
          validation={{
            required: true,
            maxLength: 254,
            pattern: EMAIL_REGEX,
          }}
        />
        <TextInput
          id="street_address"
          validation={{ required: true, maxLength: 256 }}
        />
        <TextInput
          id="contact_person_phone_number"
          validation={{ required: true, maxLength: 64 }}
        />
      </FormSection>
      <ActionButtons />
    </ApplicationForm>
  );
};

export default Step1Employer;
