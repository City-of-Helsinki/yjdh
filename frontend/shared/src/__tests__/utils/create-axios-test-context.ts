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
  //
  // If you are using jsdom, axios will default to using the XHR adapter which
  // can't be intercepted by nock. So, configure axios to use the node adapter.
  // References:
  // https://github.com/axios/axios/pull/5277
  axios.defaults.adapter = 'http';
  return axios;
};

export default createAxiosTestContext;
