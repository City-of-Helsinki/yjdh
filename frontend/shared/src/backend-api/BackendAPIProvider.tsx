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
        'X-CSRFToken': isLocalStorageCsrf
          ? getLocalStorageItem('csrfToken')
          : getLastCookieValue('yjdhcsrftoken'),
        ...headers,
      },
      withCredentials: true,
      timeout: 10 * 1000, // 10 seconds
    };

    // Force http adapter in test environment for nock compatibility
    // Axios 1.x defaults to fetch adapter which nock doesn't intercept
    if (process.env.NODE_ENV === 'test') {
      config.adapter = ['http', 'xhr', 'fetch'];
    }

    return Axios.create(config);
  }, [baseURL, headers, i18n.language, isLocalStorageCsrf]);

  return (
    <BackendAPIContext.Provider value={axios}>
      {children}
    </BackendAPIContext.Provider>
  );
};

export default BackendAPIProvider;
