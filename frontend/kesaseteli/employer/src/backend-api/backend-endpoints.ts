import BackendPath from 'kesaseteli/employer/backend-api/backend-path';

const BackendEndpoint: Record<string, BackendPath> = {
  COMPANY: '/v1/company/',
  USER: '/oidc/userinfo/',
  LOGIN: '/oidc/authenticate/',
  LOGOUT: '/oidc/logout/',
} as const;
export default BackendEndpoint;
