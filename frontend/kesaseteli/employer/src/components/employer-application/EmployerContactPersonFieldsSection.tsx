import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import Field, { $DescriptionList } from '../form/Field';

const EmployerContactPersonFieldsSection: React.FC<{
  application: HandlerEmployerApplication;
}> = ({ application }) => {
  const { t } = useTranslation();


  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="employer-contact-person-heading"
        header={t('common:handlerApplication.contact_person')}
        as="h4"
      />

      <$DescriptionList aria-labelledby="employer-contact-person-heading">
        <Field
          type="contact_person_name"
          value={application.contact_person_name || '-'}
        />
        <Field
          type="contact_person_email"
          value={application.contact_person_email || '-'}
        />
        <Field
          type="contact_person_phone_number"
          value={application.contact_person_phone_number || '-'}
        />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerContactPersonFieldsSection;
