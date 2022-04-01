import Axios from 'axios';
import React from 'react';
import { Headers } from 'shared/types/common';

import BackendAPIContext from './BackendAPIContext';

export interface BackendAPIProviderProps {
  baseURL: string;
  headers?: Headers;
}

const BackendAPIProvider: React.FC<BackendAPIProviderProps> = ({
  baseURL,
  headers,
  children,
}): JSX.Element => {
  const axiosContext = React.useMemo(
    () =>
      Axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        withCredentials: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      }),
    [baseURL, headers]
  );

  return (
    <BackendAPIContext.Provider value={axiosContext}>
      {children}
    </BackendAPIContext.Provider>
  );
};

BackendAPIProvider.defaultProps = {
  headers: undefined,
};

export default BackendAPIProvider;
