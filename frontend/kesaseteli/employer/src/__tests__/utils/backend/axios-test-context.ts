import Axios from 'axios';
import { getBackendDomain } from 'kesaseteli/employer/backend-api/backend-api';

const AxiosTestContext = Axios.create({
  baseURL: getBackendDomain(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});
// To use Nock with Axios, you may need to configure Axios to use the Node adapter
// More info https://github.com/nock/nock#axios
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,unicorn/prefer-module
AxiosTestContext.defaults.adapter = require('axios/lib/adapters/http');

export default AxiosTestContext;
