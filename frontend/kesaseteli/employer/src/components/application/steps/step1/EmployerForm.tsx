import CompanyInfoGrid from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo';
import IbanInput from 'kesaseteli/employer/components/application/form/IbanInput';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import EmployerErrorSummary from 'kesaseteli/employer/components/application/steps/step1/EmployerErrorSummary';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { EMAIL_REGEX } from 'shared/constants';

const EmployerForm: React.FC = () => {
  const { t } = useTranslation();
  const stepTitle = t('common:application.step1.header');

  return (
    <>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step1.tooltip')}
        withoutDivider
      />
      <CompanyInfoGrid />
      <EmployerErrorSummary />
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
          id="contact_person_phone_number"
          validation={{ required: true, maxLength: 64 }}
        />
        <TextInput
          id="street_address"
          validation={{ required: true, maxLength: 256 }}
        />
       <IbanInput />
      </FormSection>
    </>
  );
};

export default EmployerForm;
