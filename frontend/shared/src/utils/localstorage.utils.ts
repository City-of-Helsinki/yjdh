/* eslint-disable scanjs-rules/identifier_localStorage */
/* eslint-disable scanjs-rules/identifier_sessionStorage */

const IS_CLIENT = typeof window !== 'undefined';

export const getLocalStorageItem = (key: string): string =>
  IS_CLIENT ? localStorage.getItem(key) || '' : '';

export const setLocalStorageItem = (key: string, value: string): void =>
  IS_CLIENT && localStorage.setItem(key, value);

export const removeLocalStorageItem = (key: string): void =>
  IS_CLIENT && localStorage.removeItem(key);

export const getSessionStorageItem = (key: string): string =>
  IS_CLIENT ? sessionStorage.getItem(key) || '' : '';

export const setSessionStorageItem = (key: string, value: string): void =>
  IS_CLIENT && sessionStorage.setItem(key, value);

export const removeSessionStoragItem = (key: string): void =>
  IS_CLIENT && sessionStorage.removeItem(key);

/* eslint-enable scanjs-rules/identifier_localStorage */
/* eslint-enable scanjs-rules/identifier_sessionStorage */
