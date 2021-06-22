
const BackendEndpoint= {
  application: (id:string) => `/v1/applications/${id}`,
  applications: '/v1/applications/',
  company: '/v1/company/',
  login: '/oidc/authenticate/',
  logout: '/oidc/logout/',
  user: '/oidc/userinfo/',
} as const;
export default BackendEndpoint;
