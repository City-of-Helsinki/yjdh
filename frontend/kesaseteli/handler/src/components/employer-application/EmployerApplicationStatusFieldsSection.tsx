import HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import Field, { $DescriptionList } from '../form/Field';

const EmployerApplicationStatusSection: React.FC<{
  application: HandlerEmployerApplication;
  withoutTitle?: boolean;
}> = ({ application, withoutTitle = false }) => {
  const { t } = useTranslation();
  const sectionTitle = t('common:handlerApplication.application');

  return (
    <FormSection columns={1} withoutDivider>
      {!withoutTitle && (
        <FormSectionHeading
          aria-label={sectionTitle}
          header={sectionTitle}
          as="h4"
        />
      )}
      <$DescriptionList aria-label={sectionTitle}>
        <Field
          type="status"
          value={t(
            `common:handlerApplication.applicationStatus.${application.status}`
          )}
        />
        <Field
          type="submitted_at"
          value={convertToUIDateFormat(application.submitted_at) || '-'}
        />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerApplicationStatusSection;
