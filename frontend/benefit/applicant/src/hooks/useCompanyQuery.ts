import { useQuery, UseQueryResult } from 'react-query';

import { CompanyData } from '../types/company';
import useBackendAPI from './useBackendAPI';

const useCompanyQuery = (
  businessId: string
): UseQueryResult<CompanyData, Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<CompanyData, Error>('companyData', async () => {
    const res = axios.get<CompanyData>(`/v1/company/${businessId}`);
    return handleResponse(res);
  });
};

export default useCompanyQuery;
