type BackendPath = '/v1/company/';

export const BackendEndpoint: Record<string, BackendPath> = {
  COMPANY: '/v1/company/',
} as const;

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
