export const BackendEndpoint = {
  TET_POSTINGS: '/v1/events/',
  LOGIN_ADFS: '/oauth2/login',
  LOGOUT_ADFS: '/oauth2/logout',
  LOGIN_OIDC: '/oidc/authenticate/',
  LOGOUT_OIDC: '/oidc/logout/',
  USER: '/userinfo/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;
