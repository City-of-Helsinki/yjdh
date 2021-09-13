import {
  EMPLOYEE_EXCEPTION_REASON,
  EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT,
} from '../contants/employee-constants';

type Employment =
  // empty object to send backend when creating new employment.
  | Record<string, never>
  | {
      id: string;
      summer_voucher_exception_reason?: typeof EMPLOYEE_EXCEPTION_REASON[number];
      employee_name?: string;
      employee_school?: string;
      employee_ssn?: string;
      employee_phone_number?: string;
      employee_home_city?: string;
      employee_postcode?: number;
      employment_postcode?: number;
      employment_start_date?: string; // utc-date
      employment_end_date?: string; // utc-date
      employment_work_hours?: number;
      employment_salary_paid?: number;
      employment_description?: string;
      employee_hired_without_voucher_assessment?: typeof EMPLOYEE_HIRED_WITHOUT_VOUCHER_ASSESSMENT[number];
    };

export default Employment;
