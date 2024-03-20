import { Stepper } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import theme from 'shared/styles/theme';

import { $ApplicationStepperWrapper } from './ApplicationStepper.sc';
import { StepStateType } from './useApplicationStepper';

type ApplicationStepperProps = { stepState: StepStateType };

const ApplicationStepper: React.FC<ApplicationStepperProps> = ({
  stepState,
}: ApplicationStepperProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <$ApplicationStepperWrapper>
        <Heading
          as="h1"
          size="xl"
          weight="400"
          header={t('common:review.handling.title')}
        />
        <Stepper
          css={{
            ...theme.components.stepper.coat,
            maxWidth: '720px',
            marginLeft: '-30px',
          }}
          headingClassName="custom-stepper-heading"
          stepHeadingAriaLevel={2}
          stepHeading
          steps={stepState.steps}
          language="fi"
          selectedStep={stepState.activeStepIndex}
          onStepClick={(e) => e.stopPropagation()}
        />
        <hr />
      </$ApplicationStepperWrapper>
    </Container>
  );
};

export default ApplicationStepper;
