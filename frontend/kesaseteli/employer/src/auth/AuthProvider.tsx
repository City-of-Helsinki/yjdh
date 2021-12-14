import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import React from 'react';
import AuthContext from 'shared/auth/AuthContext';

// check that authentication is still alive in every 5 minutes
const FIVE_MINUTES = 5 * 60 * 1000;

const AuthProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const userQuery = useUserQuery<boolean>({
    select: (user) => Boolean(user),
    refetchInterval: FIVE_MINUTES,
  });
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: userQuery.isSuccess && userQuery.data,
        isLoading: userQuery.isLoading,
        isError: userQuery.isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
