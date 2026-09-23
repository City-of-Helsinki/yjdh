import type { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import { Language } from 'shared/i18n/i18n';

import type Company from './company';
import type ContactPerson from './contact-info';
import type Employment from './employment';

export type Assignee = {
  id: string;
  name: string;
};

type Application = ContactPerson & {
  id: string;
  company: Company;
  status: EmployerApplicationStatus;
  submitted_at: string; // yyyy-MM-dd
  summer_vouchers: Employment[];
  language: Language;
  user?: string;
  is_mine?: boolean;
  assignee?: Assignee | string | null;
  modified_at?: string;
};

export default Application;
