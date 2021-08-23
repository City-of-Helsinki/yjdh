import React from 'react';

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
  setAuthenticated: (value: boolean) => void;
  setError: (value: boolean) => void;
};

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isError: false,
  setAuthenticated: () => {},
  setError: () => {},
});

export default AuthContext;
