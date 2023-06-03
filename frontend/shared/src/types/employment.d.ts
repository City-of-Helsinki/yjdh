import { KesaseteliAttachment } from 'shared/types/attachment';

import {
  EMPLOYEE_EXCEPTION_REASON,
  EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT,
} from '../constants/employee-constants';

export type EmploymentExceptionReason =
  typeof EMPLOYEE_EXCEPTION_REASON[number];
export type EmployeeHiredWithoutVoucherAssessment =
  typeof EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT[number];

export type EmploymentBase = {
  employee_name?: string;
  employee_ssn?: string;
  employee_phone_number?: string;
  employee_home_city?: string;
  employee_postcode?: number;
  employee_school?: string;
};

type Employment = {
  id: string;
  target_group?: EmploymentExceptionReason;
  employee_name?: string;
  employment_postcode?: number;
  summer_voucher_serial_number: string;
  employment_start_date?: string; // yyyy-MM-dd
  employment_end_date?: string; // yyyy-MM-dd
  employment_work_hours?: number;
  employment_salary_paid?: number;
  employment_description?: string;
  hired_without_voucher_assessment?: EmployeeHiredWithoutVoucherAssessment;
  attachments: KesaseteliAttachment[];
  employment_contract: KesaseteliAttachment[];
  payslip: KesaseteliAttachment[];
} & EmploymentBase;

export default Employment;
