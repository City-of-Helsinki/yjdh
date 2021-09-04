import type Status from 'shared/types/application-status';
import type Company from 'shared/types/company';
import Employment from 'shared/types/Employment';
import type Invoicer from 'shared/types/invoicer';

type EmployerApplication = Invoicer & {
  id: string;
  company: Company;
  status: Status;
  summer_vouchers: Employment[];
};

export type DraftApplication = Omit<
  Partial<EmployerApplication>,
  'id',
  'summer_vouchers'
> & { id: string; summer_vouchers?: Partial<Employment>[] };

export default EmployerApplication;
