import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import WizardStepper from 'shared/components/stepper/WizardStepper';
import Wizard from 'shared/components/wizard/Wizard';

import { $Header, $HeaderItem, $Heading } from './ApplicationWizard.sc';

type WizardProps = {
  initialStep: number;
  lastVisitedStep?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const ApplicationWizard: React.FC<WizardProps> = ({
  initialStep,
  lastVisitedStep,
  children,
  footer,
}: WizardProps) => {
  const { t } = useTranslation();
  const Header = (
    <$Header>
      <$HeaderItem>
        <$Heading>{t('common:application.new')}</$Heading>
      </$HeaderItem>
      <$HeaderItem>
        <WizardStepper lastVisitedStep={lastVisitedStep} />
      </$HeaderItem>
    </$Header>
  );

  return (
    <Container>
      <Wizard header={Header} footer={footer} initialStep={initialStep}>
        {children}
      </Wizard>
    </Container>
  );
};

ApplicationWizard.defaultProps = {
  lastVisitedStep: undefined,
  footer: undefined,
};

export default ApplicationWizard;
