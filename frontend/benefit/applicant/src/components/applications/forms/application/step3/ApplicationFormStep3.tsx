import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

const ApplicationFormStep3: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';

  return (
    <>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        Content
      </FormSection>
    </>
  );
};

export default ApplicationFormStep3;
