import type Company from 'shared/types/company';

import type Status from './application-status';

type Application = {
  id: string;
  company: Company;
  invoicer_email: string;
  invoicer_name: string;
  invoicer_phone_number: string;
  status: Status;
  summer_vouchers: [];
};
export default Application;
