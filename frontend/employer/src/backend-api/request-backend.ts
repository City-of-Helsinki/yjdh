import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import { getBackendUrl } from 'employer/backend-api/backend-url';

const requestBackend = async <T>(
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const defaults: AxiosRequestConfig = {
    method: 'get',
    url: '/',
    baseURL: getBackendUrl(),
    responseType: 'json',
  };
  const { data } = await (axios({ ...defaults, ...config }) as AxiosPromise<T>);
  return data;
};

export default requestBackend;
