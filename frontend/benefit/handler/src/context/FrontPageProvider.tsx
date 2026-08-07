import React from 'react';

import FrontPageContext from './FrontPageContext';

const FrontPageProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): React.ReactElement => {
  const [errors, setErrors] = React.useState<Error[]>([]);

  const setError = React.useCallback(
    (error: Error): void => setErrors((prev) => [...prev, error]),
    []
  );

  const contextValue = React.useMemo(
    () => ({ errors, setError }),
    [errors, setError]
  );

  return (
    <FrontPageContext.Provider value={contextValue}>
      {children}
    </FrontPageContext.Provider>
  );
};

export default FrontPageProvider;
