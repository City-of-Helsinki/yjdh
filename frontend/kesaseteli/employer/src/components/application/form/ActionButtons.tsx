import { IconArrowLeft, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {useFormContext} from 'react-hook-form'
import useWizard from 'shared/hooks/useWizard';
import EmployerApplication from 'shared/types/employer-application';

import {
  $ApplicationAction,
  $ApplicationActions,
  $PrimaryButton,
  $SecondaryButton,
} from './ActionButtons.sc';

type Props = {
  onNext: 'sendApplication' | 'updateApplication'
};

const ActionButtons: React.FC<Props> = ({ onNext }: Props) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useFormContext<EmployerApplication>();
  const { isLoading: isApplicationLoading, ...apiOperations } = useApplicationApi();
  const {
    handleStep,
    isFirstStep,
    isLastStep,
    previousStep,
    nextStep,
    isLoading: isWizardLoading,
  } = useWizard();

  handleStep(handleSubmit(apiOperations[onNext]));
  return (
    <$ApplicationActions>
      {!isFirstStep && (
        <$ApplicationAction>
          <$SecondaryButton
            variant="secondary"
            data-testid="previous-button"
            iconLeft={<IconArrowLeft />}
            onClick={() => previousStep()}
            disabled={!isValid || isSubmitting}
          >
            {t(`common:application.buttons.previous`)}
          </$SecondaryButton>
        </$ApplicationAction>
      )}
      <$ApplicationAction>
        <$PrimaryButton
          data-testid="next-button"
          iconRight={<IconArrowRight />}
          onClick={() => nextStep()}
          loadingText={t(`common:application.loading`)}
          isLoading={isApplicationLoading || isWizardLoading}
          disabled={!isValid || isSubmitting}
        >
          {isLastStep
            ? t(`common:application.buttons.send`)
            : t(`common:application.buttons.save_and_continue`)}
        </$PrimaryButton>
      </$ApplicationAction>
    </$ApplicationActions>
  );
};

export default ActionButtons;
