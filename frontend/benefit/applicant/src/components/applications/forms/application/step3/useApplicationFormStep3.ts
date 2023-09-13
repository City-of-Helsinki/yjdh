import useFormActions from 'benefit/applicant/hooks/useFormActions';
import {
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
  PAY_SUBSIDY_GRANTED,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import isEmpty from 'lodash/isEmpty';
import { BenefitAttachment } from 'shared/types/attachment';

type ExtendedComponentProps = {
  benefitType: BENEFIT_TYPES | string | undefined;
  apprenticeshipProgram: boolean;
  showSubsidyMessage: boolean;
  handleNext: () => void;
  handleSave: () => void;
  handleBack: () => void;
  handleDelete: () => void;
  attachments: BenefitAttachment[];
  hasRequiredAttachments: boolean;
  paySubsidyGranted?: PAY_SUBSIDY_GRANTED;
};

const useApplicationFormStep3 = (
  application: Application
): ExtendedComponentProps => {
  const { onNext, onSave, onBack, onDelete } = useFormActions(application);

  const handleNext = (): void => {
    void onNext(application);
  };
  const handleSave = (): void => {
    void onSave(application);
  };
  const handleDelete = (): void => {
    void onDelete(application.id ?? '');
  };

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
      if (
        [
          PAY_SUBSIDY_GRANTED.GRANTED,
          PAY_SUBSIDY_GRANTED.GRANTED_AGED,
        ].includes(application.paySubsidyGranted)
      ) {
        hasPaySubsidyDecision = !isEmpty(
          application?.attachments?.find(
            (att) =>
              att.attachmentType === ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT
          )
        );
      }
      let hasApprenticeshipProgram = true;
      if (application.apprenticeshipProgram) {
        hasApprenticeshipProgram = !isEmpty(
          application?.attachments?.find(
            (att) => att.attachmentType === ATTACHMENT_TYPES.EDUCATION_CONTRACT
          )
        );
      }
      return (
        hasWorkContract && hasPaySubsidyDecision && hasApprenticeshipProgram
      );
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
    handleDelete,
    benefitType: application?.benefitType,
    apprenticeshipProgram: Boolean(application?.apprenticeshipProgram),
    showSubsidyMessage: false,
    attachments: application.attachments || [],
    hasRequiredAttachments: isRequiredAttachmentsUploaded(),
    paySubsidyGranted: application.paySubsidyGranted,
  };
};

export { useApplicationFormStep3 };
