import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
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
    goToPreviousStep,
    goToNextStep,
    clearStepHistory,
    isLoading: isWizardLoading,
  } = useWizard();
  const { updateApplication, sendApplication, updateApplicationQuery } =
    useApplicationApi();

  const handleSuccess = React.useCallback(
    (validatedApplication) => {
      if (!isLastStep) {
        return updateApplication(validatedApplication, () => goToNextStep());
      }
      return sendApplication(validatedApplication, onAfterLastStep);
    },
    [
      isLastStep,
      updateApplication,
      goToNextStep,
      sendApplication,
      onAfterLastStep,
    ]
  );

  const handleInvalid = React.useCallback(
    () => clearStepHistory(),
    [clearStepHistory]
  );

  const isLoading =
    isSubmitting || updateApplicationQuery.isLoading || isWizardLoading;
  return (
    <$ButtonSection columns={isFirstStep ? 1 : 2} withoutDivider>
      {!isFirstStep && (
        <$GridCell justifySelf="start">
          <Button
            variant="secondary"
            theme="black"
            data-testid="previous-button"
            iconLeft={<IconArrowLeft />}
            onClick={() => goToPreviousStep()}
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
          onClick={handleSubmit(handleSuccess, handleInvalid)}
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

ActionButtons.defaultProps = {
  onAfterLastStep: noop,
};

export default ActionButtons;
