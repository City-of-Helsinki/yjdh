import { Language } from 'shared/i18n/i18n';

import type Status from './application-status';
import type Company from './company';
import type ContactPerson from './contact-info';
import type Employment from './employment';

type Application = ContactPerson & {
  id: string;
  company: Company;
  status: Status;
  submitted_at: string; // yyyy-MM-dd
  summer_vouchers: Employment[];
  language: Language;
};

export default Application;
