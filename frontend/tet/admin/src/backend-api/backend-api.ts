export const BackendEndpoint = {
  TET_POSTINGS: '/v1/events/',
  LOGIN: '/oauth2/login',
  LOGOUT: '/oauth2/logout',
  USER: '/userinfo/',
  IMAGE: '/v1/images/',
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;
