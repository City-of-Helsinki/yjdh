import { DEFAULT_APPLICATION } from 'benefit/applicant/constants';
import React from 'react';

import { Application } from '../types/application';
import ApplicationContext from './ApplicationContext';

const ApplicationProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [application, setApplication] = React.useState<Application>(
    DEFAULT_APPLICATION
  );

  return (
    <ApplicationContext.Provider
      value={{
        application,
        isLoading: true,
        setApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
