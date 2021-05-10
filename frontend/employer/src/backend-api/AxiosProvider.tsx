import Axios from 'axios';
import { getBackendUrl } from 'employer/backend-api/backend-url';
import React from 'react';

import AxiosContext from './AxiosContext';

const AxiosProvider = ({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element => {
  const axiosContext = React.useMemo(() => {
    const axiosClient = Axios.create({
      baseURL: getBackendUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    axiosClient.interceptors.request.use((config) => {
      // Read token for anywhere, in this case directly from localStorage
      // eslint-disable-next-line scanjs-rules/identifier_localStorage
      const token = localStorage.getItem('token');
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-param-reassign
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return axiosClient;
  }, []);

  return (
    <AxiosContext.Provider value={axiosContext}>
      {children}
    </AxiosContext.Provider>
  );
};

export default AxiosProvider;
