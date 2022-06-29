export const BackendEndpoint = {
  TET_POSTINGS: '/v1/events/',
  LOGIN_ADFS: '/oauth2/login',
  LOGIN_OIDC: '/oidc/authenticate/',
  LOGOUT: '/logout/', // Backend redirects to correct logout endpoint based on login type
  USER: '/userinfo/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;
