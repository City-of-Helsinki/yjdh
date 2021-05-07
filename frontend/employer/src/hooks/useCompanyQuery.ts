import { fetchCompany } from 'employer/backend-api/company-api';
import Company from 'employer/types/company';
import { useQuery, UseQueryResult } from 'react-query';

const useCompanyQuery = (): UseQueryResult<Company, Error> =>
  useQuery<Company, Error>('company', fetchCompany);

export default useCompanyQuery;
