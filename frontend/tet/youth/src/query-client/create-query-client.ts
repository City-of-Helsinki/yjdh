import Axios, { AxiosInstance } from 'axios';
import { QueryClient, QueryFunctionContext, QueryKey } from 'react-query';
import { linkedEventsUrl, BackendEndPoints } from 'tet/youth/backend-api/backend-api';

export const createAxios = (): AxiosInstance =>
  Axios.create({
    baseURL: linkedEventsUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {},
  });

export default createQueryClient;
