/**
 * If there is multiple values of same cookie, return the last cookie.
 * A hack to get the latest value of yjdhcsrftoken
 * @param key
 */
export const getLastCookieValue = (key: string): string => {
  if (typeof document === 'undefined' || !key) {
    return '';
  }
  // https://stackoverflow.com/questions/10730362/get-cookie-by-name
  const matches = document.cookie.matchAll(
    // eslint-disable-next-line security/detect-non-literal-regexp
    new RegExp(`(^| )${key}=([^;]+)`, 'g')
  );
  // eslint-disable-next-line unicorn/prefer-spread
  const lastMatch = Array.from(matches).pop();
  return lastMatch?.[2] ?? '';
};
