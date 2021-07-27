import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

const ApplicationFormStep5: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.credentials';

  return (
    <>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        Content
      </FormSection>
    </>
  );
};

export default ApplicationFormStep5;
