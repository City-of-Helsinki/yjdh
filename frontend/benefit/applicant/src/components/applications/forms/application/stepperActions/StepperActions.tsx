import { useTranslation } from 'benefit/applicant/i18n';
import { Button, IconArrowLeft, IconArrowRight, IconCross } from 'hds-react';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

type StepperActionsProps = {
  lastStep?: boolean;
  disabledNext?: boolean;
  handleBack?: () => void;
  handleSubmit: () => void;
  handleSave: () => void;
};

const StepperActions: React.FC<StepperActionsProps> = ({
  lastStep,
  disabledNext,
  handleBack,
  handleSubmit,
  handleSave,
}: StepperActionsProps) => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.actions';
  return (
    <$Grid>
      <$GridCell $colSpan={2}>
        {handleBack && (
          <Button
            theme="black"
            variant="secondary"
            iconLeft={<IconArrowLeft />}
            onClick={handleBack}
            fullWidth
          >
            {t(`${translationsBase}.back`)}
          </Button>
        )}
      </$GridCell>
      <$GridCell $colSpan={8} justifySelf="center">
        <Button
          theme="black"
          variant="secondary"
          onClick={handleSave}
          fullWidth
        >
          {t(`${translationsBase}.saveAndContinueLater`)}
        </Button>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <Button
          theme="coat"
          disabled={disabledNext}
          iconRight={lastStep ? <IconArrowRight /> : null}
          onClick={handleSubmit}
          fullWidth
        >
          {lastStep
            ? t(`${translationsBase}.send`)
            : t(`${translationsBase}.continue`)}
        </Button>
      </$GridCell>
      <$GridCell $colSpan={10} $colStart={2} justifySelf="center">
        <Button
          theme="black"
          variant="supplementary"
          iconLeft={<IconCross />}
          fullWidth
        >
          {t(`${translationsBase}.deleteApplication`)}
        </Button>
      </$GridCell>
    </$Grid>
  );
};

const defaultProps = {
  lastStep: false,
  handleBack: undefined,
  disabledNext: false,
};

StepperActions.defaultProps = defaultProps;

export default StepperActions;
