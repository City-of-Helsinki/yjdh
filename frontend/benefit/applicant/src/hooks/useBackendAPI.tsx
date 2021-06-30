import { AxiosInstance, AxiosResponse } from 'axios';
import React from 'react';
import BackendAPIContext from 'shared/backend-api/BackendAPIContext';

const handleResponse = async <R,>(
  axiosPromise: Promise<AxiosResponse<R>>
): Promise<R> => {
  const { data } = await axiosPromise;
  return data;
};

const useBackendAPI = (): {
  axios: AxiosInstance;
  handleResponse: <R>(axiosPromise: Promise<AxiosResponse<R>>) => Promise<R>;
} => {
  const axios = React.useContext(BackendAPIContext);
  if (!axios) {
    throw new Error('Backend API Context is not set!');
  }

  return { axios, handleResponse };
};

export default useBackendAPI;
