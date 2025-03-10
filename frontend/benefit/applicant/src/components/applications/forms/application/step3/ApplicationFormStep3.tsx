import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
  ATTACHMENT_TYPES,
  PAY_SUBSIDY_GRANTED,
} from 'benefit-shared/constants';
import React from 'react';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import StepperActions from '../stepperActions/StepperActions';
import AttachmentsList from './attachmentsList/AttachmentsList';
import { useApplicationFormStep3 } from './useApplicationFormStep3';

const translationKeyForPaySubsidyAttachement = (
  paySubsidyGranted: PAY_SUBSIDY_GRANTED
): 'paySubsidyDecision' | 'paySubsidyDecisionAged' => {
  if (paySubsidyGranted === PAY_SUBSIDY_GRANTED.GRANTED) {
    return 'paySubsidyDecision';
  }
  if (paySubsidyGranted === PAY_SUBSIDY_GRANTED.GRANTED_AGED) {
    return 'paySubsidyDecisionAged';
  }
  return 'paySubsidyDecision';
};

const ApplicationFormStep3: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    handleBack,
    handleNext,
    handleSave,
    handleDelete,
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
      <ul>
        <AttachmentsList
          as="li"
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
          required
        />
        {[
          PAY_SUBSIDY_GRANTED.GRANTED,
          PAY_SUBSIDY_GRANTED.GRANTED_AGED,
        ].includes(paySubsidyGranted) && (
          <>
            {apprenticeshipProgram && (
              <AttachmentsList
                as="li"
                attachments={attachments}
                attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
                required
              />
            )}
            <AttachmentsList
              as="li"
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
              attachmentTypeTranslationKey={translationKeyForPaySubsidyAttachement(
                paySubsidyGranted
              )}
              showMessage={showSubsidyMessage}
              required
            />
          </>
        )}
        <AttachmentsList
          as="li"
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
        />
      </ul>
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
        applicationStatus={data?.status}
      />
    </>
  );
};

export default ApplicationFormStep3;
