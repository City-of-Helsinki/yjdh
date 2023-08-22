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
}): JSX.Element => (
  <BackendAPIContext.Provider
    value={Axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': isLocalStorageCsrf
          ? getLocalStorageItem('csrfToken')
          : getLastCookieValue('yjdhcsrftoken'),
        ...headers,
      },
      withCredentials: true,
    })}
  >
    {children}
  </BackendAPIContext.Provider>
);

export default BackendAPIProvider;
