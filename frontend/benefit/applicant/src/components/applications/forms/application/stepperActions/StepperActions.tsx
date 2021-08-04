import {
  $ApplicationAction,
  $ApplicationActions,
  $PrimaryButton,
  $SecondaryButton,
  $SupplementaryButton,
} from 'benefit/applicant/components/applications/Applications.sc';
import { useTranslation } from 'benefit/applicant/i18n';
import { IconArrowLeft, IconArrowRight, IconCross } from 'hds-react';
import noop from 'lodash/noop';
import * as React from 'react';

type StepperActionsProps = {
  hasBack?: boolean;
  hasNext?: boolean;
  handleBack?: () => void;
  handleSubmit?: () => void;
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
    <$ApplicationActions>
      <$ApplicationAction>
        {hasBack && (
          <$SecondaryButton
            variant="secondary"
            iconLeft={<IconArrowLeft />}
            onClick={handleBack}
          >
            {t(`${translationsBase}.back`)}
          </$SecondaryButton>
        )}
      </$ApplicationAction>
      <$ApplicationAction>
        <$SecondaryButton variant="secondary">
          {t(`${translationsBase}.saveAndContinueLater`)}
        </$SecondaryButton>
        <$SupplementaryButton variant="supplementary" iconLeft={<IconCross />}>
          {t(`${translationsBase}.deleteApplication`)}
        </$SupplementaryButton>
      </$ApplicationAction>
      <$ApplicationAction>
        <$PrimaryButton iconRight={<IconArrowRight />} onClick={handleSubmit}>
          {hasNext
            ? t(`${translationsBase}.continue`)
            : t(`${translationsBase}.send`)}
        </$PrimaryButton>
      </$ApplicationAction>
    </$ApplicationActions>
  );
};

const defaultProps = {
  hasBack: false,
  hasNext: false,
  handleBack: () => noop,
  handleSubmit: () => noop,
};

StepperActions.defaultProps = defaultProps;

export default StepperActions;
