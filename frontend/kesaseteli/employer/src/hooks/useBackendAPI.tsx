import { AxiosInstance, AxiosResponse } from 'axios';
import BackendAPIContext from 'kesaseteli/employer/backend-api/BackendAPIContext';
import React from 'react';

const handleResponse = async <R,>(
  axiosPromise: Promise<AxiosResponse<R>>
): Promise<R> => {
  const { data } = await axiosPromise;
  return data;
};

const useBackendAPI = (): {
  axios: AxiosInstance;
  handleResponse: typeof handleResponse;
} => {
  const axios = React.useContext(BackendAPIContext);
  if (!axios) {
    throw new Error('Backend API Context is not set!');
  }

  return { axios, handleResponse };
};

export default useBackendAPI;
