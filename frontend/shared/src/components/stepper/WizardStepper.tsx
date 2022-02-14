import { useTranslation } from 'next-i18next';
import * as React from 'react';
import WizardStep from 'shared/components/stepper/WizardStep';
import useWizard from 'shared/hooks/useWizard';

import { $Divider, $StepsContainer } from './Stepper.sc';

const WizardStepper: React.FC = () => {
  const { steps, activeStep } = useWizard();
  const { t } = useTranslation();
  const stepTitles = React.useMemo(() => {
    const stepNumbers = Array.from({ length: steps }, (x, i) => i);
    return stepNumbers.map((number) => ({
      title: t(`common:application.step${number + 1}.name`),
    }));
  }, [steps, t]);
  return (
    <$StepsContainer>
      {stepTitles.map((step, index, arr) => (
        <React.Fragment key={step.title}>
          <WizardStep index={index} title={step.title} />
          {index < arr.length - 1 && <$Divider isActive={index < activeStep} />}
        </React.Fragment>
      ))}
    </$StepsContainer>
  );
};

WizardStepper.defaultProps = {
  lastVisitedStep: 1,
};

export default WizardStepper;
