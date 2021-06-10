import { useTranslation } from 'benefit/applicant/i18n';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

const ApplicationFormStep3: React.FC<DynamicFormStepComponentProps> = ({
  actions,
}) => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';

  return (
    <>
      <FormSection header={t(`${translationsBase}.heading1`)}>
        Content
      </FormSection>
      {actions}
    </>
  );
};

export default ApplicationFormStep3;
