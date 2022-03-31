import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import WizardStepper from 'shared/components/stepper/WizardStepper';
import Wizard from 'shared/components/wizard/Wizard';

import { $Header, $HeaderItem, $Heading } from './ApplicationWizard.sc';

type WizardProps = {
  initialStep?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

const ApplicationWizard: React.FC<WizardProps> = ({
  initialStep = 0,
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
        <WizardStepper />
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
  initialStep: 0,
  footer: null,
};

export default ApplicationWizard;
