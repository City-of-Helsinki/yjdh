import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import React, { useEffect } from 'react';

import StepperActions from '../stepperActions/StepperActions';
import AttachmentsList from './attachmentsList/AttachmentsList';
import { useApplicationFormStep3 } from './useApplicationFormStep3';

const ApplicationFormStep3: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    handleBack,
    handleNext,
    handleSave,
    benefitType,
    apprenticeshipProgram,
    showSubsidyMessage,
    attachments,
  } = useApplicationFormStep3(data);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <AttachmentsIngress />
      {(benefitType === BENEFIT_TYPES.SALARY ||
        benefitType === BENEFIT_TYPES.EMPLOYMENT) && (
        <>
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
          />
          {apprenticeshipProgram && (
            <AttachmentsList
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
            />
          )}
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
            showMessage={showSubsidyMessage}
          />
        </>
      )}
      {benefitType === BENEFIT_TYPES.COMMISSION && (
        <AttachmentsList
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
        />
      )}
      <AttachmentsList
        attachments={attachments}
        attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
      />
      <StepperActions
        handleSubmit={handleNext}
        handleSave={handleSave}
        handleBack={handleBack}
      />
    </>
  );
};

export default ApplicationFormStep3;
