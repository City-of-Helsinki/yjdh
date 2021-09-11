// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable scanjs-rules/identifier_localStorage */
export const clearLocalStorage = (keyPrefix?: string): void => {
  if (!keyPrefix) {
    localStorage.clear();
  } else {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(keyPrefix))
      .forEach((key) => localStorage.removeItem(key));
  }
};
