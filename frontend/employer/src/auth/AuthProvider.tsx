import useUserQuery from 'employer/hooks/useUserQuery';
import React from 'react';

import AuthContext from './AuthContext';

const AuthProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const { data: user, isLoading, error: queryError } = useUserQuery();
  const [isAuthenticated, setAuthenticated] = React.useState(Boolean(user));
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (queryError) {
      setAuthenticated(false);
      setError(queryError.message);
    }
  }, [queryError, user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        setAuthenticated,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
