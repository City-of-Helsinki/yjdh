import Axios from 'axios';
import { getBackendDomain } from 'kesaseteli/employer/backend-api/backend-api';

const AxiosTestContext = Axios.create({
  baseURL: getBackendDomain(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export default AxiosTestContext;
