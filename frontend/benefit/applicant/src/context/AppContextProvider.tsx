import React from 'react';

import { SubmittedApplication } from '../types/application';
import AppContext from './AppContext';

const AppProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [submittedApplication, setSubmittedApplication] =
    React.useState<SubmittedApplication | null>(null);
  const [hasMessenger, setHasMessenger] = React.useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        hasMessenger,
        setHasMessenger,
        submittedApplication,
        setSubmittedApplication,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
