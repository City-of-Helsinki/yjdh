import BackendPath from 'kesaseteli/employer/backend-api/backend-path';
import getBackendDomain from 'kesaseteli/employer/backend-api/get-backend-domain';

const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;

export default getBackendUrl;
