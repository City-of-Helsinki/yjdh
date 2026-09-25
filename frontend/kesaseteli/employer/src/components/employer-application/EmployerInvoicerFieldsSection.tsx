import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import Field, { $DescriptionList } from '../form/Field';

/**
 * Renders separate invoicer details (name, email, phone number) when the
 * employer has explicitly designated a different person or entity as the invoicer.
 */
const EmployerInvoicerFieldsSection: React.FC<{
  application: HandlerEmployerApplication;
}> = ({ application }) => {
  const { t } = useTranslation();

  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="employer-invoicer-heading"
        header={t('common:handlerApplication.invoicer')}
        as="h4"
      />
      <$DescriptionList aria-labelledby="employer-invoicer-heading">
        <Field type="invoicer_name" value={application.invoicer_name || '-'} />
        <Field
          type="invoicer_email"
          value={application.invoicer_email || '-'}
        />
        <Field
          type="invoicer_phone_number"
          value={application.invoicer_phone_number || '-'}
        />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerInvoicerFieldsSection;
