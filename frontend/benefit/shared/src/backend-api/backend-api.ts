import { Headers } from 'shared/types/common';

export const BackendEndpoint = {
  LOGIN: '/oidc/authenticate/',
  LOGOUT: '/oidc/logout/',
  USER: '/oidc/userinfo/',
  COMPANY: '/v1/company/',
  APPLICATIONS: '/v1/applications/',
  HANDLER_APPLICATIONS: '/v1/handlerapplications/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getHeaders = (language: string): Headers => ({
  'Accept-Language': language,
});

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
