import React from 'react';

import { SubmittedApplication } from '../types/application';
import AppContext from './AppContext';

const FrontPageProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [submittedApplication, setSubmittedApplication] =
    React.useState<SubmittedApplication | null>(null);

  return (
    <AppContext.Provider
      value={{
        submittedApplication,
        setSubmittedApplication,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default FrontPageProvider;
