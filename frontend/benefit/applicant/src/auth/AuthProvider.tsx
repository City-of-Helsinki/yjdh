import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import React from 'react';
import AuthContext from 'shared/auth/AuthContext';

const AuthProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const userQuery = useUserQuery((user) => Boolean(user));
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
