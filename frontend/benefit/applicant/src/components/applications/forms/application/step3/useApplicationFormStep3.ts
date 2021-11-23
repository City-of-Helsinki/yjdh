import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit/applicant/constants';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import { Application } from 'benefit/applicant/types/application';
import isEmpty from 'lodash/isEmpty';
import Attachment from 'shared/types/attachment';

type ExtendedComponentProps = {
  benefitType: BENEFIT_TYPES | string | undefined;
  apprenticeshipProgram: boolean;
  showSubsidyMessage: boolean;
  handleNext: () => void;
  handleSave: () => void;
  handleBack: () => void;
  attachments: Attachment[];
  hasRequiredAttachments: boolean;
  paySubsidyGranted: boolean;
};

const useApplicationFormStep3 = (
  application: Application
): ExtendedComponentProps => {
  const { onNext, onSave, onBack } = useFormActions(application);

  const handleNext = (): void => onNext(application);
  const handleSave = (): void => onSave(application);

  const isRequiredAttachmentsUploaded = (): boolean => {
    if (
      application.benefitType === BENEFIT_TYPES.EMPLOYMENT ||
      application.benefitType === BENEFIT_TYPES.SALARY
    ) {
      const hasWorkContract = !isEmpty(
        application.attachments?.find(
          (att) => att.attachmentType === ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT
        )
      );
      let hasPaySubsidyDecision = true;
      if (application.paySubsidyGranted) {
        hasPaySubsidyDecision = !isEmpty(
          application?.attachments?.find(
            (att) =>
              att.attachmentType === ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT
          )
        );
      }
      return hasWorkContract && hasPaySubsidyDecision;
    }
    if (application.benefitType === BENEFIT_TYPES.COMMISSION) {
      return !isEmpty(
        application.attachments?.find(
          (att) => att.attachmentType === ATTACHMENT_TYPES.COMMISSION_CONTRACT
        )
      );
    }
    // helsinki voucher is not required in any case
    return false;
  };

  return {
    handleNext,
    handleSave,
    handleBack: onBack,
    benefitType: application?.benefitType,
    apprenticeshipProgram: Boolean(application?.apprenticeshipProgram),
    showSubsidyMessage: Boolean(
      application?.paySubsidyPercent && application?.additionalPaySubsidyPercent
    ),
    attachments: application.attachments || [],
    hasRequiredAttachments: isRequiredAttachmentsUploaded(),
    paySubsidyGranted: Boolean(application.paySubsidyGranted),
  };
};

export { useApplicationFormStep3 };
