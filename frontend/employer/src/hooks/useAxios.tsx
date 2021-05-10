import { AxiosInstance } from 'axios';
import AxiosContext from 'employer/backend-api/AxiosContext';
import React from 'react';

const useAxios = (): AxiosInstance => {
  const context = React.useContext(AxiosContext);
  if (!context) {
    throw new Error('Axios Context is not set!');
  }
  return context;
};

export default useAxios;
