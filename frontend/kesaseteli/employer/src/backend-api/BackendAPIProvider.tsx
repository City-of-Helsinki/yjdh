import Axios from 'axios';
import getBackendUrl from 'employer/backend-api/backend-url';
import React from 'react';

import BackendAPIContext from './BackendAPIContext';

const BackendAPIProvider = ({
  children,
}: React.PropsWithChildren<unknown>): JSX.Element => {
  const axiosContext = React.useMemo(
    () =>
      Axios.create({
        baseURL: getBackendUrl(),
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
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
