import { Button, IconArrowLeft, IconArrowRight, IconCross } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import useConfirm from 'shared/hooks/useConfirm';
import useGoToPage from 'shared/hooks/useGoToPage';
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
    setError,
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
  const {
    updateApplication,
    sendApplication,
    deleteApplication,
    updateApplicationQuery,
  } = useApplicationApi({ setBackendValidationError: setError });

  const { confirm } = useConfirm();
  const goToPage = useGoToPage();

  const handleCancel = React.useCallback(async () => {
    const isConfirmed = await confirm({
      header: t('common:application.buttons.cancel_confirmation_title'),
      content: t('common:application.buttons.cancel_confirmation_description'),
      submitButtonLabel: t('common:application.buttons.cancel'),
      submitButtonVariant: 'danger',
    });
    if (isConfirmed) {
      deleteApplication(() => goToPage('/'));
    }
  }, [confirm, deleteApplication, goToPage, t]);

  const handleSuccess = React.useCallback(
    (validatedApplication: Application) => {
      if (!isLastStep) {
        return updateApplication(validatedApplication, () => {
          // eslint-disable-next-line no-console
          console.debug('ActionButtons: goToNextStep called');
          void goToNextStep();
        });
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
    (errors: unknown) => {
      // eslint-disable-next-line no-console
      console.debug('ActionButtons: handleInvalid called', errors);
      clearStepHistory();
    },
    [clearStepHistory]
  );

  const isLoading =
    isSubmitting || updateApplicationQuery.isLoading || isWizardLoading;

  return (
    <$ButtonSection columns={3} withoutDivider>
      <$GridCell justifySelf="start">
        <Button
          variant="supplementary"
          theme="black"
          data-testid="cancel-button"
          iconLeft={<IconCross />}
          onClick={handleCancel}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {t(`common:application.buttons.cancel`)}
        </Button>
      </$GridCell>
      <$GridCell justifySelf="center">
        {!isFirstStep && (
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
        )}
      </$GridCell>
      <$GridCell justifySelf="end">
        <Button
          theme="coat"
          data-testid="next-button"
          iconRight={<IconArrowRight />}
          onClick={(e) => {
            // eslint-disable-next-line no-console
            console.debug('ActionButtons: handleSubmit called');
            void handleSubmit(handleSuccess, handleInvalid)(e);
          }}
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
