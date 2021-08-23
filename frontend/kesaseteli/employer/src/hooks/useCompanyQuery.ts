import useApplicationQuery from 'kesaseteli/employer/hooks/useApplicationQuery';
import { UseQueryResult } from 'react-query';
import Company from 'shared/types/company';
import Application from 'shared/types/employer-application';

export type UseCompanyResult = Omit<
  UseQueryResult<Application, Error>,
  'data'
> & { data: Company | undefined };

const useCompanyQuery = (applicationId: string): UseCompanyResult => {
  const { data: application, ...rest } = useApplicationQuery(applicationId);
  const company = application?.company;
  return { data: company, ...rest };
};

export default useCompanyQuery;
