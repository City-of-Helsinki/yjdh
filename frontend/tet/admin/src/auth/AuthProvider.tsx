import React from 'react';
import AuthContext from 'shared/auth/AuthContext';
import useUserQuery from 'tet/admin/hooks/backend/useUserQuery';

const FIVE_MINUTES = 5 * 60 * 1000;

const AuthProvider = <P,>({ children }: React.PropsWithChildren<P>): JSX.Element => {
  const userQuery = useUserQuery<boolean>({
    select: (user) => Boolean(user),
    // check that authentication is still alive in every 5 minutes
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
