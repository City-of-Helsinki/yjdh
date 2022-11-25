import * as React from 'react';

import { StepProps } from './Step';
import {
  $Divider,
  $StepCircle,
  $StepsContainer,
  $StepTitle,
} from './Stepper.sc';

type StepperProps = { activeStep?: number; steps: StepProps[] };

const Stepper: React.FC<StepperProps> = ({ activeStep = 1, steps }) => (
  <$StepsContainer>
    {steps.map((step, index) => (
      <React.Fragment key={step.title}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <$StepCircle isActive={index < activeStep}>{index + 1}</$StepCircle>

          {index < steps.length - 1 && (
            <$Divider isActive={index < activeStep - 1} />
          )}
        </div>

        <$StepTitle isActive={index < activeStep}>{step.title}</$StepTitle>
      </React.Fragment>
    ))}
  </$StepsContainer>
);

export default Stepper;
