import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.HANDLER_URL ?? 'https://localhost:3200', path);
