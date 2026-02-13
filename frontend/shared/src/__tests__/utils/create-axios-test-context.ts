import Axios, { AxiosInstance } from 'axios';

const createAxiosTestContext = (baseURL: string): AxiosInstance =>
  Axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

export default createAxiosTestContext;
