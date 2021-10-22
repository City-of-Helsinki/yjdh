import { Headers } from 'shared/types/common';

type BackendPath = '/v1/company/' | '/v1/applications/';

export const BackendEndpoint: Record<string, BackendPath> = {
  COMPANY: '/v1/company/',
  APPLICATIONS: '/v1/applications/',
} as const;

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getHeaders = (language: string): Headers => ({
  'Accept-Language': language,
});

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
