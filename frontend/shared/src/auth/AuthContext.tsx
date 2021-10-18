import React from 'react';

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isError: boolean;
};

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  isError: false,
});

export default AuthContext;
