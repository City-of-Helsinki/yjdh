// When mocking integrations, use the OIDC endpoints for backend endpoints
const mockFlag = process.env.NEXT_PUBLIC_MOCK_FLAG === '1';

export const BackendEndpoint = {
  TET_POSTINGS: '/v1/events/',
  LOGIN: mockFlag ? '/oidc/authenticate/' : '/oauth2/login',
  LOGOUT: mockFlag ? '/oidc/logout/' : '/oauth2/logout',
  USER: mockFlag ? '/oidc/userinfo/' : '/TODO/what', // TODO do we need to implement userinfo like in oidc?
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string => `${getBackendDomain()}${path}`;
