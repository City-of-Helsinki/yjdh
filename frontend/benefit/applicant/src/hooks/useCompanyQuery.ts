import { useQuery, UseQueryResult } from 'react-query';

import { BackendEndpoint } from '../backend-api/backend-api';
import { CompanyData } from '../types/company';
import useBackendAPI from './useBackendAPI';

const useCompanyQuery = (): UseQueryResult<CompanyData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<CompanyData, Error>(
    'companyData',
    async () => {
      const res = axios.get<CompanyData>(BackendEndpoint.COMPANY);
      return handleResponse(res);
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
};

export default useCompanyQuery;
