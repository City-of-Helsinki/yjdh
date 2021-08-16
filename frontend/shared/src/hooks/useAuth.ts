import React from 'react';
import AuthContext, { AuthContextType } from 'shared/auth/AuthContext';

const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthClient must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
