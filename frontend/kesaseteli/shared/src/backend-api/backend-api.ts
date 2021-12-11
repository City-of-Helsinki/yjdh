export const BackendEndpoint = {
  APPLICATIONS: '/v1/applications/',
  SUMMER_VOUCHERS: '/v1/summervouchers/',
  ATTACHMENTS: '/attachments/',
  LOGIN: '/oidc/authenticate/',
  LOGOUT: '/oidc/logout/',
  USER: '/oidc/userinfo/',
  YOUTH_APPLICATIONS: '/v1/youthapplications/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;
