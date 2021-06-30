import useApplicationQuery from 'kesaseteli/employer/hooks/useApplicationQuery';
import Application from 'kesaseteli/employer/types/application';
import { UseQueryResult } from 'react-query';
import Company from 'shared/types/company';

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
