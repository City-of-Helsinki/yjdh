import Axios from 'axios';
import React from 'react';

import BackendAPIContext from './BackendAPIContext';

export interface BackendAPIProviderProps {
  baseURL: string;
}

const BackendAPIProvider: React.FC<BackendAPIProviderProps> = ({
  baseURL,
  children,
}): JSX.Element => {
  const axiosContext = React.useMemo(
    () =>
      Axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      }),
    [baseURL]
  );

  return (
    <BackendAPIContext.Provider value={axiosContext}>
      {children}
    </BackendAPIContext.Provider>
  );
};

export default BackendAPIProvider;
