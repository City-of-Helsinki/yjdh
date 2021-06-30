export type BackendPath =
  | '/v1/applications/'
  | '/oidc/userinfo/'
  | '/oidc/authenticate/'
  | '/oidc/logout/';

export const BackendEndpoint: Record<string, BackendPath> = {
  APPLICATIONS: '/v1/applications/',
  LOGIN: '/oidc/authenticate/',
  LOGOUT: '/oidc/logout/',
  USER: '/oidc/userinfo/',
} as const;

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
