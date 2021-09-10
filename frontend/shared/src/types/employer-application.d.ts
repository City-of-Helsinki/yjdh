import type Status from 'shared/types/application-status';
import type Company from 'shared/types/company';
import type Invoicer from 'shared/types/invoicer';

type EmployerApplication = Invoicer & {
  id: string;
  company: Company;
  status: Status;
};
export default EmployerApplication;
