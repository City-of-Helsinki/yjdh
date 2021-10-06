import { BENEFIT_TYPES } from 'benefit/applicant/constants';
import { useFormActions } from 'benefit/applicant/hooks/useFormActions';
import { Application } from 'benefit/applicant/types/application';
import Attachment from 'shared/types/attachment';

type ExtendedComponentProps = {
  benefitType: BENEFIT_TYPES | string | undefined;
  apprenticeshipProgram: boolean;
  showSubsidyMessage: boolean;
  handleNext: () => void;
  handleSave: () => void;
  handleBack: () => void;
  attachments: Attachment[];
};

const useApplicationFormStep3 = (
  application: Application
): ExtendedComponentProps => {
  const { onNext, onSave, onBack } = useFormActions(application, 3);

  const handleNext = (): void => onNext(application);
  const handleSave = (): void => onSave(application);

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
  };
};

export { useApplicationFormStep3 };
