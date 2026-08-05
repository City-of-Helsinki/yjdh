import Axios from 'axios';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';
import { Headers } from 'shared/types/common';
import { getLocalStorageItem } from 'shared/utils/localstorage.utils';

import BackendAPIContext from './BackendAPIContext';

export interface BackendAPIProviderProps {
  children?: React.ReactNode;
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
  const { i18n } = useTranslation();

  const axios = useMemo(() => {
    const config: Record<string, unknown> = {
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': i18n.language,
        ...headers,
      },
      withCredentials: true,
      timeout: 30 * 1000, // 30 seconds
    };

    // Force http adapter in test environment for nock compatibility
    // Axios 1.x defaults to fetch adapter which nock doesn't intercept
    if (process.env.NODE_ENV === 'test') {
      config.adapter = ['http', 'xhr', 'fetch'];
    }

    const instance = Axios.create(config);

    // The CSRF token must be read per request, not once when the instance is
    // created: the cookie can be issued, rotated or removed at any point in
    // the session, and this instance outlives client side navigation.
    instance.interceptors.request.use((requestConfig) => {
      if (headers?.['X-CSRFToken']) {
        return requestConfig;
      }
      const csrfToken = isLocalStorageCsrf
        ? getLocalStorageItem('csrfToken')
        : getLastCookieValue('yjdhcsrftoken');
      requestConfig.headers.set('X-CSRFToken', csrfToken);
      return requestConfig;
    });

    return instance;
  }, [baseURL, headers, i18n.language, isLocalStorageCsrf]);

  return (
    <BackendAPIContext.Provider value={axios}>
      {children}
    </BackendAPIContext.Provider>
  );
};

export default BackendAPIProvider;
