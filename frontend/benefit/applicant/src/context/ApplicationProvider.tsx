import { DeMinimisAid } from 'benefit/applicant//types/application';
import React from 'react';

import ApplicationContext from './ApplicationContext';

const ApplicationProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [applicationId, setApplicationId] = React.useState<string>('');
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [deMinimisAids, setDeMinimisAids] = React.useState<DeMinimisAid[]>([]);

  return (
    <ApplicationContext.Provider
      value={{
        applicationId,
        currentStep,
        deMinimisAids,
        isLoading: true,
        setApplicationId,
        setCurrentStep,
        setDeMinimisAids,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
