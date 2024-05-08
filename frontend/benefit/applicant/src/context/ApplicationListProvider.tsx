import ApplicationListContext, {
  ApplicationListContextType,
} from 'benefit/applicant/context/ApplicationListContext';
import React from 'react';

const ApplicationListProvider = ({
  children,
  count,
  list,
}: React.PropsWithChildren<ApplicationListContextType>): JSX.Element => (
  <ApplicationListContext.Provider
    value={{
      count,
      list,
    }}
  >
    {children}
  </ApplicationListContext.Provider>
);

export default ApplicationListProvider;
