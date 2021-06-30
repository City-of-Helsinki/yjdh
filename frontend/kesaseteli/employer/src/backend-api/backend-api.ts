type BackendPath =
  | '/v1/company/'
  | '/oidc/userinfo/'
  | '/oidc/authenticate/'
  | '/oidc/logout/';

export const BackendEndpoint: Record<string, BackendPath> = {
  COMPANY: '/v1/company/',
  USER: '/oidc/userinfo/',
  LOGIN: '/oidc/authenticate/',
  LOGOUT: '/oidc/logout/',
} as const;

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
