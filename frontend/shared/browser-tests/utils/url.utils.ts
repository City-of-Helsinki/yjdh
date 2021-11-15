export const getUrl = (baseUrl = '', path?: string): string =>
  `${baseUrl}${path?.startsWith('/') ? path : path ? `/${path}` : ''}`;

export const SuomiFiAuthorizationUrls = [
  'https://testi.apro.tunnistus.fi/',
  'https://tunnistus.test.hel.ninja',
];

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.FRONTEND_URL, path);
