import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.APPLICANT_URL ?? 'https://localhost:3000', path);
