import { AxiosInstance } from 'axios';
import BackendAPIContext from 'employer/backend-api/BackendAPIContext';
import React from 'react';

const useBackendAPI = (): { axios: AxiosInstance } => {
  const axios = React.useContext(BackendAPIContext);
  if (!axios) {
    throw new Error('Backend API Context is not set!');
  }
  return { axios };
};

export default useBackendAPI;
