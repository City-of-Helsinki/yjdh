export type ApplicationListType = 'youth' | 'employer';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  ADDITIONAL_INFORMATION_REQUESTED = 'additional_information_requested',
  ADDITIONAL_INFORMATION_PROVIDED = 'additional_information_provided',
  HANDLING = 'handling',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type BaseApplicationFields = {
  id: string;
  status: ApplicationStatus;
};

export type YouthApplication = BaseApplicationFields & {
  created_at?: string;
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
