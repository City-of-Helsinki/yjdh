import type { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import type { YouthApplicationStatus } from 'kesaseteli-shared/constants/youth-application-status';

export const APPLICATION_LIST_TYPES = {
  YOUTH: 'youth',
  EMPLOYER: 'employer',
} as const;

export type ApplicationListType =
  (typeof APPLICATION_LIST_TYPES)[keyof typeof APPLICATION_LIST_TYPES];

export type BaseApplicationFields = {
  id: string;
  created_at?: string;
};

export type YouthApplication = BaseApplicationFields & {
  status: YouthApplicationStatus;
  first_name?: string;
  last_name?: string;
  social_security_number?: string;
  summer_voucher_serial_number?: string;
  age?: number;
  birth_year?: number;
  target_group_name?: string;
};

export type EmployerApplication = BaseApplicationFields & {
  status: EmployerApplicationStatus;
  submitted_at?: string;
  company?: {
    name: string;
    business_id: string;
  };
  summer_vouchers?: {
    id: string;
    employee_name?: string;
    summer_voucher_serial_number?: string;
  }[];
};

export type BaseApplication = YouthApplication | EmployerApplication;

export type ListTypeForApplication<T extends BaseApplication> =
  T extends EmployerApplication
    ? (typeof APPLICATION_LIST_TYPES)['EMPLOYER']
    : T extends YouthApplication
    ? (typeof APPLICATION_LIST_TYPES)['YOUTH']
    : never;

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
