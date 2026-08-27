export const APPLICATION_LIST_TYPES = {
  YOUTH: 'youth',
  EMPLOYER: 'employer',
} as const;

export type ApplicationListType = typeof APPLICATION_LIST_TYPES[keyof typeof APPLICATION_LIST_TYPES];

export enum YouthApplicationStatus {
    SUBMITTED = "submitted",
    AWAITING_MANUAL_PROCESSING = "awaiting_manual_processing",
    ADDITIONAL_INFORMATION_REQUESTED = "additional_information_requested",
    ADDITIONAL_INFORMATION_PROVIDED = "additional_information_provided",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
}

export enum EmployerApplicationStatus {
    DRAFT = "draft",
    IN_HANDLING_QUEUE = "in_handling_queue",
    APPLICATION_HANDLING = "application_handling",
    ADDITIONAL_INFORMATION_REQUESTED = "additional_information_requested",
    PAYMENT_REVIEW = "payment_review",
    ACCEPTED_FOR_PAYMENT = "accepted_for_payment",
    SENT_FOR_PAYMENT = "sent_for_payment",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
}

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

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
