import WizardContext, {
  WizardValues,
} from 'kesaseteli/employer/contexts/WizardContext';
import React from 'react';

const useWizard = (): WizardValues => {
  const context = React.useContext(WizardContext);

  if (!context) {
    throw new Error('Wrap your step with `Wizard`');
  } else {
    return context;
  }
};

export default useWizard;
