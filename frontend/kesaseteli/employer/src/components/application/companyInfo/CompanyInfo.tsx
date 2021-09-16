import CompanyInfoCell from 'kesaseteli/employer/components/application/companyInfo/CompanyInfoCell';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

import CompanyInfoHeader from './CompanyInfoHeader';

const CompanyInfo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <FormSection
      aria-label={t(`common:application.step1.companyInfoGrid.title`)}
      size="xs"
      columns={6}
    >
      <CompanyInfoHeader field="name" />
      <CompanyInfoHeader field="business_id" />
      <CompanyInfoHeader field="industry" />
      <CompanyInfoHeader field="company_form" />
      <CompanyInfoHeader field="postcode" />
      <CompanyInfoHeader field="city" />
      <CompanyInfoCell field="name" />
      <CompanyInfoCell field="business_id" />
      <CompanyInfoCell field="industry" />
      <CompanyInfoCell field="company_form" />
      <CompanyInfoCell field="postcode" />
      <CompanyInfoCell field="city" />
    </FormSection>
  );
};

export default CompanyInfo;
