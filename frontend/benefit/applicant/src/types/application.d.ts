import { DefaultTheme } from 'styled-components';

import { APPLICATION_STATUSES } from '../constants';

export interface Employee {
  first_name: string;
  last_name: string;
}

export interface ApplicationData {
  id: string;
  status: APPLICATION_STATUSES;
  last_modified_at: string;
  submitted_at: string;
  application_number: number;
  employee: Employee;
}

interface ApplicationAllowedAction {
  label: string;
  handleAction: () => void;
  Icon?: React.FC;
}

export interface ApplicationListItemData {
  id: string;
  name: string;
  avatar: {
    initials: string;
    color: keyof DefaultTheme['colors'];
  };
  statusText?: string;
  modifiedAt?: string;
  submittedAt?: string;
  applicationNum?: number;
  allowedAction: ApplicationAllowedAction;
}
