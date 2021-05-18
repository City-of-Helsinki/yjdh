import React from 'react';

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | undefined;
  setAuthenticated: (value: boolean) => void;
  setError: (value: string) => void;
};

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  setAuthenticated: () => {},
  error: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setError: (value: string) => {},
});

export default AuthContext;
