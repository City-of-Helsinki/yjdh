import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { BackendEndpoint } from '../backend-api/backend-api';
import { CompanyData } from '../types/company';

const useCompanyQuery = (): UseQueryResult<CompanyData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<CompanyData, Error>(
    'companyData',
    async () => {
      const res = axios.get<CompanyData>(BackendEndpoint.COMPANY);
      return handleResponse(res);
    },
    {
      staleTime: Infinity,
    }
  );
};

export default useCompanyQuery;
