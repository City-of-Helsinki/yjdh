const LOCAL_ENV_URL = 'http://localhost:3000';
export const getEnvUrl = (path = ''): string => {
  const baseUrl = process.env.BROWSER_TESTS_LOCAL_ENV_URL ?? LOCAL_ENV_URL;
  return `${baseUrl}${path?.startsWith('/') ? path : `/${path ?? ''}`}`;
};
