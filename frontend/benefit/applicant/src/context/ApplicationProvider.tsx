import { DEFAULT_APPLICATION } from 'benefit/applicant/constants';
import React from 'react';

import { Application } from '../types/common';
import ApplicationContext from './ApplicationContext';

const ApplicationProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [application, setApplication] = React.useState<Application>(
    DEFAULT_APPLICATION
  );

  return (
    <ApplicationContext.Provider
      value={{
        currentStep,
        application,
        isLoading: true,
        setCurrentStep,
        setApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
