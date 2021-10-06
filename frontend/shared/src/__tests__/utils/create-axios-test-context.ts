import Axios, { AxiosInstance } from 'axios';

const createAxiosTestContext = (baseURL: string): AxiosInstance => {
  const axios = Axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  // To use Nock with Axios, you may need to configure Axios to use the Node adapter
  // More info https://github.com/nock/nock#axios
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,unicorn/prefer-module
  axios.defaults.adapter = require('axios/lib/adapters/http');
  return axios;
};

export default createAxiosTestContext;
