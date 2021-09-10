import React from 'react';
import WizardContext, { WizardValues } from 'shared/contexts/WizardContext';

const useWizard = (): WizardValues => {
  const context = React.useContext(WizardContext);

  if (!context) {
    throw new Error('Wrap your step with `Wizard`');
  } else {
    return context;
  }
};

export default useWizard;
