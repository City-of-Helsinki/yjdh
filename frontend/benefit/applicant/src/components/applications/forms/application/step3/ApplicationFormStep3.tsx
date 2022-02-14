import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import React from 'react';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

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
    handleDelete,
    benefitType,
    apprenticeshipProgram,
    paySubsidyGranted,
    showSubsidyMessage,
    attachments,
    hasRequiredAttachments,
  } = useApplicationFormStep3(data);

  const theme = useTheme();

  return (
    <>
      <AttachmentsIngress />
      {(benefitType === BENEFIT_TYPES.SALARY ||
        benefitType === BENEFIT_TYPES.EMPLOYMENT) && (
        <>
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
            required
          />
          {apprenticeshipProgram && (
            <AttachmentsList
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
              required
            />
          )}
          {paySubsidyGranted && (
            <AttachmentsList
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
              showMessage={showSubsidyMessage}
              required
            />
          )}
        </>
      )}
      {benefitType === BENEFIT_TYPES.COMMISSION && (
        <AttachmentsList
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
          required
        />
      )}
      <AttachmentsList
        attachments={attachments}
        attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
      />
      <$Hr
        css={`
          margin: ${theme.spacing.l} 0;
        `}
      />
      <StepperActions
        disabledNext={!hasRequiredAttachments}
        handleSubmit={handleNext}
        handleSave={handleSave}
        handleBack={handleBack}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default ApplicationFormStep3;
