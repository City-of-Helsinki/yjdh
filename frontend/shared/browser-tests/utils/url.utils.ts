import { ClientFunction } from 'testcafe';

export const getCurrentUrl = ClientFunction(() => document.location.href);
export const getCurrentPathname = ClientFunction(
  () => document.location.pathname
);
export const getUrlParam = ClientFunction((param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
});

export const getUrl = (baseUrl = '', path?: string): string =>
  `${baseUrl}${path?.startsWith('/') ? path : path ? `/${path}` : ''}`;

export const SuomiFiAuthorizationUrls = [
  'https://testi.apro.tunnistus.fi/',
  'https://tunnistus.test.hel.ninja',
];

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.FRONTEND_URL, path);
