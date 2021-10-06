import type Status from './application-status';
import type Company from './company';
import Employment from './employment';
import type Invoicer from './invoicer';

type EmployerApplication = Invoicer & {
  id: string;
  company: Company;
  status: Status;
  summer_vouchers: Employment[];
};

export default EmployerApplication;
