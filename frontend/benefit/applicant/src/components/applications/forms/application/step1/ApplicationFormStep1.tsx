import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

const ApplicationFormStep1: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';
  return (
    <>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        Content
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading2`)}>
        Content
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading3`)}>
        Content
      </FormSection>
      <FormSection header={t(`${translationsBase}.heading4`)}>
        Content
      </FormSection>
    </>
  );
};

export default ApplicationFormStep1;
