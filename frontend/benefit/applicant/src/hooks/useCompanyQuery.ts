import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { CompanyData } from '../types/company';

const useCompanyQuery = (): UseQueryResult<CompanyData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<CompanyData, Error>({
    queryKey: ['companyData'],
    queryFn: async () => {
      const res = axios.get<CompanyData>(BackendEndpoint.COMPANY);
      return handleResponse(res);
    },
    staleTime: Infinity,
  });
};

export default useCompanyQuery;
