import { IconArrowLeft, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';
import useWizard from 'shared/hooks/useWizard';
import Application from 'shared/types/employer-application';

import {
  $ApplicationAction,
  $ApplicationActions,
  $PrimaryButton,
  $SecondaryButton,
} from './ActionButtons.sc';

type Props = {
  onNext: 'sendApplication' | 'updateApplication';
};

const ActionButtons: React.FC<Props> = ({ onNext }: Props) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<Application>();
  const {
    isFirstStep,
    isLastStep,
    previousStep,
    nextStep,
    isLoading: isWizardLoading,
  } = useWizard();
  const apiOperations = useApplicationApi({
    onUpdateSuccess: () => void nextStep(),
  });
  const { isSyncing } = useIsSyncingToBackend();

  const isLoading = isSubmitting || isSyncing || isWizardLoading;
  return (
    <$ApplicationActions>
      {!isFirstStep && (
        <$ApplicationAction>
          <$SecondaryButton
            variant="secondary"
            data-testid="previous-button"
            iconLeft={<IconArrowLeft />}
            onClick={() => previousStep()}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {t(`common:application.buttons.previous`)}
          </$SecondaryButton>
        </$ApplicationAction>
      )}
      <$ApplicationAction>
        <$PrimaryButton
          data-testid="next-button"
          iconRight={<IconArrowRight />}
          onClick={handleSubmit(apiOperations[onNext])}
          loadingText={t(`common:application.loading`)}
          isLoading={isLoading}
          disabled={isLoading}
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
