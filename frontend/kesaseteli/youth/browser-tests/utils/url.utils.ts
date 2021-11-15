import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.YOUTH_URL ?? 'https://localhost:3100', path);
