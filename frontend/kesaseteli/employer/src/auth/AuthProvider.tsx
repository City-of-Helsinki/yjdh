import useUserQuery from 'employer/hooks/useUserQuery';
import React from 'react';

import AuthContext from './AuthContext';

const AuthProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const { data: user, isLoading, isError } = useUserQuery();
  const [, setAuthenticated] = React.useState(false);
  const [, setError] = React.useState(false);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isLoading,
        isError,
        setAuthenticated,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
