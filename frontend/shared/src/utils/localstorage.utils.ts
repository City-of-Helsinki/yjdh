/* eslint-disable scanjs-rules/identifier_localStorage */

const IS_CLIENT = typeof window !== 'undefined';

export const getLocalStorageItem = (key: string): string =>
  IS_CLIENT ? localStorage.getItem(key) || '' : '';

export const setLocalStorageItem = (key: string, value: string): void =>
  IS_CLIENT && localStorage.setItem(key, value);

export const removeLocalStorageItem = (key: string): void =>
  IS_CLIENT && localStorage.removeItem(key);

/* eslint-enable scanjs-rules/identifier_localStorage */
