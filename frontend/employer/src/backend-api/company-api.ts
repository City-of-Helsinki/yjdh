import requestBackend from 'employer/backend-api/request-backend';
import Company from 'employer/types/company';

export const fetchCompany = (): Promise<Company> =>
  requestBackend<Company>({ url: '/v1/company/' });
