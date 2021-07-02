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
