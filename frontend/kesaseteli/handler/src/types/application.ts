export const APPLICATION_LIST_TYPES = {
  YOUTH: 'youth',
  EMPLOYER: 'employer',
} as const;

export type ApplicationListType =
  (typeof APPLICATION_LIST_TYPES)[keyof typeof APPLICATION_LIST_TYPES];

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  AWAITING_MANUAL_PROCESSING = 'awaiting_manual_processing',
  ADDITIONAL_INFORMATION_REQUESTED = 'additional_information_requested',
  ADDITIONAL_INFORMATION_PROVIDED = 'additional_information_provided',
  HANDLING = 'handling',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PAYMENT_REVIEW = 'payment_review',
  ACCEPTED_FOR_PAYMENT = 'accepted_for_payment',
  SENT_FOR_PAYMENT = 'sent_for_payment',
  RECEIVED_BY_PAYMENT_SYSTEM = 'received_by_payment_system',
  ERROR_IN_PAYMENT = 'error_in_payment',
  CANCELLED = 'cancelled',
}

/**
 * Employer application statuses that have been fully handled.
 * Attachments cannot be deleted from applications in these statuses.
 * Mirrors backend EmployerApplicationStatus.handled_values().
 */
export const HANDLED_EMPLOYER_APPLICATION_STATUSES = [
  ApplicationStatus.ACCEPTED_FOR_PAYMENT,
  ApplicationStatus.SENT_FOR_PAYMENT,
  ApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
  ApplicationStatus.REJECTED,
  ApplicationStatus.CANCELLED,
] as const satisfies readonly ApplicationStatus[];

export const HANDLED_APPLICATION_STATUSES =
  HANDLED_EMPLOYER_APPLICATION_STATUSES;

export type HandledEmployerApplicationStatus =
  (typeof HANDLED_EMPLOYER_APPLICATION_STATUSES)[number];

export const isHandledEmployerApplicationStatus = (
  status?: string | ApplicationStatus | null
): status is HandledEmployerApplicationStatus =>
  Boolean(
    status &&
      (
        HANDLED_EMPLOYER_APPLICATION_STATUSES as readonly ApplicationStatus[]
      ).includes(status as ApplicationStatus)
  );

export type BaseApplicationFields = {
  id: string;
  status: ApplicationStatus;
  created_at?: string;
};

export type YouthApplication = BaseApplicationFields & {
  first_name?: string;
  last_name?: string;
  social_security_number?: string;
  summer_voucher_serial_number?: string;
  age?: number;
  birth_year?: number;
  target_group_name?: string;
};

export type EmployerApplication = BaseApplicationFields & {
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

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
