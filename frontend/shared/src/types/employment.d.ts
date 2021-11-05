import Attachment from 'shared/types/attachment';

import {
  EMPLOYEE_EXCEPTION_REASON,
  EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT,
} from '../constants/employee-constants';

export type EmploymentExceptionReason =
  typeof EMPLOYEE_EXCEPTION_REASON[number];
export type EmployeeHiredWithoutVoucherAssessment =
  typeof EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT[number];

type Employment = {
  id: string;
  summer_voucher_exception_reason?: EmploymentExceptionReason;
  employee_name?: string;
  employee_ssn?: string;
  employee_phone_number?: string;
  employee_home_city?: string;
  employee_postcode?: number;
  employment_postcode?: number;
  summer_voucher_serial_number: string;
  employee_school?: string;
  employment_start_date?: string; // yyyy-MM-dd
  employment_end_date?: string; // yyyy-MM-dd
  employment_work_hours?: number;
  employment_salary_paid?: number;
  employment_description?: string;
  hired_without_voucher_assessment?: EmployeeHiredWithoutVoucherAssessment;
  attachments: Attachment[];
  employment_contract: Attachment[];
  payslip: Attachment[];
};

export default Employment;
