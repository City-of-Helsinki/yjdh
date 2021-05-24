import AuthContext, { AuthContextType } from 'employer/auth/AuthContext';
import React from 'react';

const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthClient must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
