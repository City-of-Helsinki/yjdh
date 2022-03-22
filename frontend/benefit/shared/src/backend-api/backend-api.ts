import { Headers } from 'shared/types/common';

export const BackendEndpoint = {
  LOGIN: '/oidc/authenticate/',
  OAUTH_LOGIN: '/oauth2/login',
  LOGOUT: '/oidc/logout/',
  USER: '/oidc/userinfo/',
  USER_ME: 'v1/users/me',
  COMPANY: '/v1/company/',
  APPLICATIONS: '/v1/applications/',
  HANDLER_APPLICATIONS: '/v1/handlerapplications/',
  APPROVE_TERMS_OF_SERVICE: '/v1/terms/approve_terms_of_service/',
  APPLICATION_BATCHES: '/v1/applicationbatches/',
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
