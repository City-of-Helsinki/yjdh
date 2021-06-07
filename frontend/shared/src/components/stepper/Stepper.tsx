import * as React from 'react';

import Step, { StepProps } from './Step';
import { StyledDivider, StyledStepsContainer } from './styled';

type StepperProps = { activeStep?: number; steps: StepProps[] };

const Stepper: React.FC<StepperProps> = ({ activeStep = 1, steps }) => (
  <StyledStepsContainer>
    {steps.map((step, index) => (
      <React.Fragment key={step.title}>
        <Step activeStep={activeStep} index={index} title={step.title} />
        {index < steps.length - 1 && (
          <StyledDivider isActive={index < activeStep - 1} />
        )}
      </React.Fragment>
    ))}
  </StyledStepsContainer>
);

const defaultProps = {
  activeStep: 1,
};

Stepper.defaultProps = defaultProps;

export default Stepper;
