import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

const ApplicationFormStep3: React.FC = () => {
  return (
    <>
      <FormSection>
        <AttachmentsIngress />
      </FormSection>
    </>
  );
};

export default ApplicationFormStep3;
