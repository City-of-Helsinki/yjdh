import React from 'react';
import WizardContext, { WizardValues } from 'shared/contexts/WizardContext';

const useWizard = (): WizardValues => {
  const context = React.useContext(WizardContext);

  if (context) {
    return context;
  }
  throw new Error('Wrap your step with `Wizard`');
};

export default useWizard;
