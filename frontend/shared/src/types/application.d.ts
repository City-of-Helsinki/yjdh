import { Language } from 'shared/i18n/i18n';

import type Status from './application-status';
import type Company from './company';
import type ContactPerson from './contact-info';
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
    language: Language;
  };

export default Application;
