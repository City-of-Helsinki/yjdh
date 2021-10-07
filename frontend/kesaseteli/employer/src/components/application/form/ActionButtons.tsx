import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';
import useWizard from 'shared/hooks/useWizard';
import Application from 'shared/types/application-form-data';

import { $ButtonSection } from './ActionButtons.sc';

type Props = {
  onAfterLastStep?: () => void;
};

const ActionButtons: React.FC<Props> = ({ onAfterLastStep = noop }) => {
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
  const { updateApplication, sendApplication } = useApplicationApi();
  const { isSyncing } = useIsSyncingToBackend();

  const handleSuccess = React.useCallback(
    (validatedApplication) => {
      if (!isLastStep) {
        return updateApplication(validatedApplication, () => void nextStep());
      }
      return sendApplication(validatedApplication, onAfterLastStep);
    },
    [isLastStep, updateApplication, nextStep, sendApplication, onAfterLastStep]
  );

  const isLoading = isSubmitting || isSyncing || isWizardLoading;
  return (
    <$ButtonSection columns={isFirstStep ? 1 : 2} withoutDivider>
      {!isFirstStep && (
        <$GridCell justifySelf="start">
          <Button
            variant="secondary"
            theme="black"
            data-testid="previous-button"
            iconLeft={<IconArrowLeft />}
            onClick={() => previousStep()}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {t(`common:application.buttons.previous`)}
          </Button>
        </$GridCell>
      )}
      <$GridCell justifySelf="end">
        <Button
          theme="coat"
          data-testid="next-button"
          iconRight={<IconArrowRight />}
          onClick={handleSubmit(handleSuccess)}
          loadingText={t(`common:application.loading`)}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLastStep
            ? t(`common:application.buttons.last`)
            : t(`common:application.buttons.next`)}
        </Button>
      </$GridCell>
    </$ButtonSection>
  );
};

export default ActionButtons;
