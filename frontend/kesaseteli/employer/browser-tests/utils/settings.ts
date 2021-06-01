import { getUrl } from '@frontend/shared/browser-tests/utils/settings';

export const getEmployerUiUrl = (path = ''): string =>
  getUrl(process.env.EMPLOYER_URL, path);

export const getHandlerUiUrl = (path = ''): string =>
  getUrl(process.env.HANDLER_URL, path);

export const SuomiFiAuthorizationUrl = 'https://testi.apro.tunnistus.fi/';
