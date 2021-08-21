import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
import Application from 'kesaseteli/employer/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useWizard from 'shared/hooks/useWizard';

type Props = {
  onSubmit: (application: Application) => void;
};

const ActionButtons = ({ onSubmit }: Props): ReturnType<typeof Button> => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useApplicationForm();
  const { isLoading: isApplicationLoading } = useApplicationApi();
  const {
    handleStep,
    isFirstStep,
    isLastStep,
    previousStep,
    nextStep,
    isLoading: isWizardLoading,
  } = useWizard();

  handleStep(handleSubmit(onSubmit));
  return (
    <>
      {!isFirstStep && (
        <Button
          data-testid="previous-button"
          iconRight={<IconArrowLeft />}
          onClick={() => previousStep()}
          disabled={!isValid || isSubmitting}
        >
          {t(`common:application.buttons.previous`)}
        </Button>
      )}
      <Button
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
      </Button>
    </>
  );
};

export default ActionButtons;
