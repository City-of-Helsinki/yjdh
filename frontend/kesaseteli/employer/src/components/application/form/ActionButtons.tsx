import { Button, IconArrowLeft, IconArrowRight } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useWizard from 'shared/hooks/useWizard';
import Application from 'shared/types/employer-application';

import { $ApplicationAction, $ApplicationActions } from './ActionButtons.sc';

type Props = {
  onSubmit: (application: Application) => void;
};

const ActionButtons: React.FC<Props> = ({ onSubmit }: Props) => {
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
    <$ApplicationActions>
      {!isFirstStep && (
        <$ApplicationAction>
          <Button
            variant="secondary"
            theme="black"
            data-testid="previous-button"
            iconLeft={<IconArrowLeft />}
            onClick={() => previousStep()}
            disabled={!isValid || isSubmitting}
          >
            {t(`common:application.buttons.previous`)}
          </Button>
        </$ApplicationAction>
      )}
      <$ApplicationAction>
        <Button
          theme="coat"
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
      </$ApplicationAction>
    </$ApplicationActions>
  );
};

export default ActionButtons;
