import { AxiosInstance } from 'axios';
import React from 'react';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';

const useBackendAPI = (): { axios: AxiosInstance } => {
  const axios = React.useContext(BackendAPIContext);
  if (!axios) {
    throw new Error('Backend API Context is not set!');
  }
  return { axios };
};

export default useBackendAPI;
