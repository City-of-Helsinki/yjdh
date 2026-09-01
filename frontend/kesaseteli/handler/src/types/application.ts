import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import type { YouthApplicationStatus } from 'kesaseteli-shared/constants/youth-application-status';

export const APPLICATION_LIST_TYPES = {
  YOUTH: 'youth',
  EMPLOYER: 'employer',
} as const;

export type ApplicationListType =
  (typeof APPLICATION_LIST_TYPES)[keyof typeof APPLICATION_LIST_TYPES];

/**
 * Employer application statuses that have been fully handled.
 * Attachments cannot be deleted from applications in these statuses.
 * Mirrors backend EmployerApplicationStatus.handled_values().
 */
export const HANDLED_EMPLOYER_APPLICATION_STATUSES = [
  EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
  EmployerApplicationStatus.SENT_FOR_PAYMENT,
  EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
  EmployerApplicationStatus.REJECTED,
  EmployerApplicationStatus.CANCELLED,
] as const satisfies readonly EmployerApplicationStatus[];

export type HandledEmployerApplicationStatus =
  (typeof HANDLED_EMPLOYER_APPLICATION_STATUSES)[number];

export const isHandledEmployerApplicationStatus = (
  status?: string | EmployerApplicationStatus | null
): status is HandledEmployerApplicationStatus =>
  Boolean(
    status &&
      (
        HANDLED_EMPLOYER_APPLICATION_STATUSES as readonly EmployerApplicationStatus[]
      ).includes(status as EmployerApplicationStatus)
  );

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

export type StatusTypeForListType<T extends ApplicationListType> = {
  [APPLICATION_LIST_TYPES.YOUTH]: YouthApplicationStatus;
  [APPLICATION_LIST_TYPES.EMPLOYER]: EmployerApplicationStatus;
}[T];

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
