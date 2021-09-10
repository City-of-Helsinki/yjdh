import * as React from 'react';

import Step, { StepProps } from './Step';
import { $Divider, $StepsContainer } from './Stepper.sc';

type StepperProps = { activeStep?: number; steps: StepProps[] };

const Stepper: React.FC<StepperProps> = ({ activeStep = 1, steps }) => (
  <$StepsContainer>
    {steps.map((step, index) => (
      <React.Fragment key={step.title}>
        <Step activeStep={activeStep} index={index} title={step.title} />
        {index < steps.length - 1 && (
          <$Divider isActive={index < activeStep - 1} />
        )}
      </React.Fragment>
    ))}
  </$StepsContainer>
);

export default Stepper;
