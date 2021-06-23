import Axios from 'axios';
import { getBackendDomain } from 'kesaseteli/employer/backend-api/backend-api';
import React from 'react';

import BackendAPIContext from './BackendAPIContext';

const BackendAPIProvider = ({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element => {
  const axiosContext = React.useMemo(
    () =>
      Axios.create({
        baseURL: getBackendDomain(),
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
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
