import Axios from 'axios';
import React from 'react';
import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';
import { Headers } from 'shared/types/common';
import { getLocalStorageItem } from 'shared/utils/localstorage.utils';

import BackendAPIContext from './BackendAPIContext';

export interface BackendAPIProviderProps {
  baseURL: string;
  headers?: Headers;
  isLocalStorageCsrf?: boolean;
}

const BackendAPIProvider: React.FC<BackendAPIProviderProps> = ({
  baseURL,
  headers,
  isLocalStorageCsrf = false,
  children,
}): JSX.Element => {
  const config: Record<string, unknown> = {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': isLocalStorageCsrf
        ? getLocalStorageItem('csrfToken')
        : getLastCookieValue('yjdhcsrftoken'),
      ...headers,
    },
    withCredentials: true,
  };

  // Force http adapter in test environment for nock compatibility
  // Axios 1.x defaults to fetch adapter which nock doesn't intercept
  if (process.env.NODE_ENV === 'test') {
    config.adapter = ['http', 'xhr', 'fetch'];
  }

  return (
    <BackendAPIContext.Provider value={Axios.create(config)}>
      {children}
    </BackendAPIContext.Provider>
  );
};

export default BackendAPIProvider;
