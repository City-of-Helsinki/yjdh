import React from 'react';

import FrontPageContext from './FrontPageContext';

const FrontPageProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [errors, setErrors] = React.useState<Error[]>([]);

  const setError = (error: Error): void => setErrors([...errors, error]);

  return (
    <FrontPageContext.Provider
      value={{
        errors,
        setError,
      }}
    >
      {children}
    </FrontPageContext.Provider>
  );
};

export default FrontPageProvider;
