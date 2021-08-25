import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

import StepperActions from '../stepperActions/StepperActions';
import AttachmentsList from './attachmentsList/AttachmentsList';
import { useApplicationFormStep3 } from './useApplicationFormStep3';

const ApplicationFormStep3: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    handleBack,
    handleNext,
    benefitType,
    apprenticeshipProgram,
    showSubsidyMessage,
  } = useApplicationFormStep3(data);

  return (
    <>
      <FormSection>
        <AttachmentsIngress />
        {benefitType === BENEFIT_TYPES.SALARY ||
          (benefitType === BENEFIT_TYPES.EMPLOYMENT && (
            <>
              <AttachmentsList
                attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
              />
              {apprenticeshipProgram && (
                <AttachmentsList
                  attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
                />
              )}
              <AttachmentsList
                attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
                showMessage={showSubsidyMessage}
              />
            </>
          ))}
        {benefitType === BENEFIT_TYPES.COMMISSION && (
          <AttachmentsList
            attachmentType={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
          />
        )}
        <AttachmentsList
          attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
        />
      </FormSection>
      <StepperActions
        hasBack
        hasNext
        handleSubmit={handleNext}
        handleBack={handleBack}
      />
    </>
  );
};

export default ApplicationFormStep3;
