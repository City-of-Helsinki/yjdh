export const getUrl = (baseUrl = '', path?: string): string =>
  `${baseUrl}${path?.startsWith('/') ? path : path ? `/${path}` : ''}`;

export const SuomiFiAuthorizationUrl = 'https://testi.apro.tunnistus.fi/';
