import * as React from 'react';

import {
  StyledStepCircle,
  StyledStepContainer,
  StyledStepTitle,
} from './styled';

export type StepProps = { title: string; index?: number; activeStep?: number };

const Step = ({
  activeStep = 0,
  title,
  index = 0,
}: StepProps): React.ReactElement => {
  const isActive = index < activeStep;

  return (
    <StyledStepContainer>
      <StyledStepCircle isActive={isActive}>{index + 1}</StyledStepCircle>
      <StyledStepTitle isActive={isActive}>{title}</StyledStepTitle>
    </StyledStepContainer>
  );
};

export default Step;
