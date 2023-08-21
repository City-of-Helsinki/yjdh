import Axios from 'axios';
import React from 'react';
import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';
import { Headers } from 'shared/types/common';

import BackendAPIContext from './BackendAPIContext';

export interface BackendAPIProviderProps {
  baseURL: string;
  headers?: Headers;
  useLocalStorageCsrf?: boolean;
}

const getCsrfToken = (useLocalStorageCsrf: boolean): string => {
  if (useLocalStorageCsrf)
    return typeof window !== 'undefined'
      ? // eslint-disable-next-line scanjs-rules/identifier_localStorage
        localStorage.getItem('csrfToken') || ''
      : '';
  return getLastCookieValue('yjdhcsrftoken');
};

const BackendAPIProvider: React.FC<BackendAPIProviderProps> = ({
  baseURL,
  headers,
  useLocalStorageCsrf = false,
  children,
}): JSX.Element => (
  <BackendAPIContext.Provider
    value={Axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(useLocalStorageCsrf),
        ...headers,
      },
      withCredentials: true,
    })}
  >
    {children}
  </BackendAPIContext.Provider>
);

export default BackendAPIProvider;
