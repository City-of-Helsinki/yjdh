import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.HANDLER_URL ?? 'https://localhost:3100', path);

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';
