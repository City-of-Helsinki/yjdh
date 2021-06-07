import {
  StyledApplicationAction,
  StyledApplicationActions,
  StyledPrimaryButton,
  StyledSecondaryButton,
  StyledSupplementaryButton,
} from 'benefit/applicant/components/applications/styled';
import { useTranslation } from 'benefit/applicant/i18n';
import { IconArrowLeft, IconArrowRight, IconCross } from 'hds-react';
import * as React from 'react';

type StepperActionsProps = {
  hasBack: boolean;
  hasNext: boolean;
  handleBack: () => void;
  handleSubmit: () => void;
};

const StepperActions: React.FC<StepperActionsProps> = ({
  hasBack,
  hasNext,
  handleBack,
  handleSubmit,
}: StepperActionsProps) => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.actions';
  return (
    <StyledApplicationActions>
      <StyledApplicationAction>
        {hasBack && (
          <StyledSecondaryButton
            variant="secondary"
            iconLeft={<IconArrowLeft />}
            onClick={handleBack}
          >
            {t(`${translationsBase}.back`)}
          </StyledSecondaryButton>
        )}
      </StyledApplicationAction>
      <StyledApplicationAction>
        <StyledSecondaryButton variant="secondary">
          {t(`${translationsBase}.saveAndContinueLater`)}
        </StyledSecondaryButton>
        <StyledSupplementaryButton
          variant="supplementary"
          iconLeft={<IconCross />}
        >
          {t(`${translationsBase}.deleteApplication`)}
        </StyledSupplementaryButton>
      </StyledApplicationAction>
      <StyledApplicationAction>
        <StyledPrimaryButton
          iconRight={<IconArrowRight />}
          onClick={handleSubmit}
        >
          {hasNext
            ? t(`${translationsBase}.continue`)
            : t(`${translationsBase}.send`)}
        </StyledPrimaryButton>
      </StyledApplicationAction>
    </StyledApplicationActions>
  );
};

export default StepperActions;
