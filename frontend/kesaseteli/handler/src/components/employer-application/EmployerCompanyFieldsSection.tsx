import React from 'react';
import { useTranslation } from 'react-i18next';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import Field, { $DescriptionList } from '../form/Field';

const EmployerCompanyFieldsSection: React.FC<{
  application: HandlerEmployerApplication;
}> = ({ application }) => {
  const { t } = useTranslation();
  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="employer-company-heading"
        header={t('common:handlerApplication.employerCompanySectionTitle')}
        as="h4"
      />
      <$DescriptionList aria-labelledby="employer-company-heading">
        <Field type="name" value={application.company.name || '-'} />
        <Field
          type="business_id"
          value={application.company.business_id || '-'}
        />
        <Field type="industry" value={application.company.industry || '-'} />
        <Field
          type="company_form"
          value={application.company.company_form || '-'}
        />
        <Field
          type="company_street_address"
          value={application.company.street_address || '-'}
        />
        <Field
          type="company_postcode"
          value={application.company.postcode || '-'}
        />
        <Field type="city" value={application.company.city || '-'} />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerCompanyFieldsSection;
