import { AxiosInstance, AxiosResponse } from 'axios';
import * as React from 'react';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { renderHook } from '@testing-library/react-hooks';

const CSRF_COOKIE_NAME = 'yjdhcsrftoken';

const setCookie = (value: string): void => {
  document.cookie = `${CSRF_COOKIE_NAME}=${value}`;
};

const clearCookie = (): void => {
  document.cookie = `${CSRF_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

/**
 * Sends a request through the instance without hitting the network and
 * returns the CSRF header the request would have carried.
 */
const getSentCsrfHeader = async (axios: AxiosInstance): Promise<unknown> => {
  let sentHeader: unknown;
  await axios.request({
    url: '/v1/whatever/',
    method: 'POST',
    adapter: (config) => {
      sentHeader = config.headers?.['X-CSRFToken'];
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse);
    },
  });
  return sentHeader;
};

const renderBackendAPI = (): AxiosInstance => {
  const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <BackendAPIProvider baseURL="https://localhost:8000">
      {children}
    </BackendAPIProvider>
  );
  const { result } = renderHook(() => useBackendAPI(), { wrapper });
  return result.current.axios;
};

describe('BackendAPIProvider CSRF token', () => {
  afterEach(() => {
    clearCookie();
  });

  it('sends the CSRF cookie value that exists at request time', async () => {
    setCookie('token-at-mount');
    const axios = renderBackendAPI();

    expect(await getSentCsrfHeader(axios)).toBe('token-at-mount');
  });

  it('picks up a CSRF cookie that appears after the provider was mounted', async () => {
    clearCookie();
    const axios = renderBackendAPI();

    setCookie('token-issued-later');

    expect(await getSentCsrfHeader(axios)).toBe('token-issued-later');
  });

  it('picks up a CSRF cookie that changed after the provider was mounted', async () => {
    setCookie('stale-token');
    const axios = renderBackendAPI();

    setCookie('rotated-token');

    expect(await getSentCsrfHeader(axios)).toBe('rotated-token');
  });
});
