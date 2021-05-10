import { AxiosError } from 'axios';
import { fetchCompany } from 'employer/backend-api/company-api';
import Company from 'employer/types/company';
import { useQuery, UseQueryResult } from 'react-query';

const useCompanyQuery = (): UseQueryResult<Company, AxiosError> =>
  useQuery<Company, Error>('company', fetchCompany, {
    retry: (failureCount, error) =>
      (error as AxiosError).response?.status === 404 && failureCount <= 3,
    retryDelay: (retryCount) => (retryCount === 0 ? 0 : 20000),
  });

export default useCompanyQuery;
