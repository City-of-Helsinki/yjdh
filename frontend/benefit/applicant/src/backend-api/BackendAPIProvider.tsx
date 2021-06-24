import Axios from 'axios';
import React from 'react';

import { getBackendDomain } from './backend-api';
import BackendAPIContext from './BackendAPIContext';

const BackendAPIProvider: React.FC = ({ children }) => {
  const axiosContext = React.useMemo(
    () =>
      Axios.create({
        baseURL: getBackendDomain(),
        headers: {
          'Content-Type': 'application/json',
        },
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      }),
    []
  );

  return (
    <BackendAPIContext.Provider value={axiosContext}>
      {children}
    </BackendAPIContext.Provider>
  );
};

export default BackendAPIProvider;
