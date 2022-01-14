export const BackendEndpoint = {
  TET_POSTINGS: '/tet/postings',
  LOGIN: '/oidc/authenticate/', // TODO /oauth2/
  LOGOUT: '/oidc/logout/', // TODO /oauth2/
  USER: '/oidc/userinfo/', // TODO /oauth2/
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;
