import { ApplicationTempData } from 'benefit/applicant//types/application';
import React from 'react';

import ApplicationContext from './ApplicationContext';

const ApplicationProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [
    applicationTempData,
    setApplicationTempData,
  ] = React.useState<ApplicationTempData>({
    id: '',
    deMinimisAids: [],
    currentStep: 1,
  });

  const setCurrentStep = (step: number): void =>
    setApplicationTempData({ ...applicationTempData, currentStep: step });
  return (
    <ApplicationContext.Provider
      value={{
        applicationTempData,
        isLoading: true,
        setApplicationTempData,
        setCurrentStep,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
