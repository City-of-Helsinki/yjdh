import type Status from './application-status';
import type Company from './company';
import type ContactPerson from './contact_person';
import type Employment from './employment';
import type Invoicer from './invoicer';

type Application = ContactPerson &
  Invoicer & {
    id: string;
    company: Company;
    is_separate_invoicer?: boolean;
    status: Status;
    submitted_at: string; // yyyy-MM-dd
    summer_vouchers: Employment[];
  };

export default Application;
