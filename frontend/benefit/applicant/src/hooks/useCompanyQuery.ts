import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

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
