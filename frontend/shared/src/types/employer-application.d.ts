import type Status from 'shared/types//application-status';
import type Invoicer from 'shared/types//invoicer';
import type Company from 'shared/types/company';

type EmployerApplication = Invoicer & {
  id: string;
  company: Company;
  status: Status;
  summer_vouchers: [];
};
export default EmployerApplication;
