import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import React from 'react';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import { BenefitAttachment } from 'shared/types/attachment';
import { useTheme } from 'styled-components';

import StepperActions from '../stepperActions/StepperActions';
import AttachmentsList from './attachmentsList/AttachmentsList';
import { useApplicationFormStep3 } from './useApplicationFormStep3';

const ApplicationFormStep3: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const [attachments, setAttachments] = React.useState<BenefitAttachment[]>(
    data.attachments ?? []
  );

  React.useEffect(() => {
    setAttachments((currentAttachments) => {
      const attachmentsById = new Map<string, BenefitAttachment>();

      currentAttachments.forEach((attachment) => {
        attachmentsById.set(attachment.id, attachment);
      });

      (data.attachments ?? []).forEach((attachment) => {
        attachmentsById.set(attachment.id, attachment);
      });

      return [...attachmentsById.values()];
    });
  }, [data.attachments]);

  const handleUploadSuccess = React.useCallback(
    (uploadedAttachment: BenefitAttachment): void => {
      setAttachments((currentAttachments) => {
        const attachmentsById = new Map<string, BenefitAttachment>();

        currentAttachments.forEach((attachment) => {
          attachmentsById.set(attachment.id, attachment);
        });

        attachmentsById.set(uploadedAttachment.id, uploadedAttachment);

        return [...attachmentsById.values()];
      });
    },
    []
  );

  const handleRemoveSuccess = React.useCallback(
    (removedAttachmentId: string): void => {
      setAttachments((currentAttachments) =>
        currentAttachments.filter(
          (attachment) => attachment.id !== removedAttachmentId
        )
      );
    },
    []
  );

  const {
    handleBack,
    handleNext,
    handleSave,
    handleDelete,
    apprenticeshipProgram,
    hasRequiredAttachments,
  } = useApplicationFormStep3({
    ...data,
    attachments,
  });

  const theme = useTheme();

  return (
    <>
      <AttachmentsIngress />
      <ul>
        <AttachmentsList
          as="li"
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
          onUploadSuccess={handleUploadSuccess}
          onRemoveSuccess={handleRemoveSuccess}
          required
        />
        {apprenticeshipProgram && (
          <AttachmentsList
            as="li"
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
            onUploadSuccess={handleUploadSuccess}
            onRemoveSuccess={handleRemoveSuccess}
            required
          />
        )}
        <AttachmentsList
          as="li"
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
          onUploadSuccess={handleUploadSuccess}
          onRemoveSuccess={handleRemoveSuccess}
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
        applicationStatus={data?.status ?? APPLICATION_STATUSES.DRAFT}
      />
    </>
  );
};

export default ApplicationFormStep3;
