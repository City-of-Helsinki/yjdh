import * as React from 'react';

import { $StepCircle, $StepContainer, $StepTitle } from './Stepper.sc';

export type StepProps = { title: string; index?: number; activeStep?: number };

const Step = ({
  activeStep = 0,
  title,
  index = 0,
}: StepProps): React.ReactElement => {
  const isActive = index < activeStep;

  return (
    <$StepContainer>
      <$StepCircle isActive={isActive}>{index + 1}</$StepCircle>
      <$StepTitle isActive={isActive}>{title}</$StepTitle>
    </$StepContainer>
  );
};

export default Step;
