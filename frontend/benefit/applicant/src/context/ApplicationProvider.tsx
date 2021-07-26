import { DEFAULT_APPLICATION } from 'benefit/applicant/constants';
import React from 'react';

import { Application, DeMinimisAid } from '../types/application';
import ApplicationContext from './ApplicationContext';

const ApplicationProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [application, setApplication] = React.useState<Application>(
    DEFAULT_APPLICATION as Application
  );
  const [deMinimisAids, setDeMinimisAids] = React.useState<DeMinimisAid[]>([]);

  return (
    <ApplicationContext.Provider
      value={{
        application,
        deMinimisAids,
        isLoading: true,
        setApplication,
        setDeMinimisAids,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export default ApplicationProvider;
