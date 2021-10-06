import { ApplicationTempData } from 'benefit/applicant//types/application';
import React from 'react';

import ApplicationContext from './ApplicationContext';

const ApplicationProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [applicationTempData, setApplicationTempData] =
    React.useState<ApplicationTempData>({
      id: '',
      deMinimisAids: [],
    });

  return (
    <ApplicationContext.Provider
      value={{
        applicationTempData,
        isLoading: true,
        setApplicationTempData,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
