import * as React from 'react';

import { StepProps } from './Step';
import {
  $Divider,
  $StepCircle,
  $StepItem,
  $StepContainer,
  $StepTitle,
} from './Stepper.sc';

type StepperProps = {
  activeStep?: number;
  steps: StepProps[];
  as?: 'div' | 'ol';
};

const Stepper: React.FC<StepperProps> = ({
  activeStep = 1,
  steps,
  as: containerTag,
}) => (
  <$StepContainer as={containerTag}>
    {steps.map((step, index) => (
      <React.Fragment key={step.title}>
        <$StepItem
          as={containerTag === 'ol' ? 'li' : 'div'}
          aria-label={`${index + 1}. ${step.title}`}
          aria-current={activeStep - 1 === index ? 'step' : false}
        >
          <$StepCircle isActive={index < activeStep}>{index + 1}</$StepCircle>

          {index < steps.length - 1 && (
            <$Divider isActive={index < activeStep - 1} />
          )}
        </$StepItem>

        <$StepTitle isActive={index < activeStep}>{step.title}</$StepTitle>
      </React.Fragment>
    ))}
  </$StepContainer>
);

export default Stepper;
