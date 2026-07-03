import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import type { HandlerSummerVoucher } from '../../types/HandlerEmployerApplication';

export const mockVoucher1: HandlerSummerVoucher = {
  id: 'voucher-1',
  summer_voucher_serial_number: 'SN-001',
  employee_name: 'Maija Meikäläinen',
  employee_birthdate: '2006-05-01',
  employee_school: 'Helsingin lukio',
  employee_phone_number: '0401234567',
  employee_home_city: 'Helsinki',
  employee_postcode: '00100',
  employment_postcode: '00100',
  employment_start_date: '2024-06-01',
  employment_end_date: '2024-06-30',
  employment_work_hours: 60,
  employment_salary_paid: 500,
  employment_description: 'Siivoustehtäviä',
  hired_without_voucher_assessment: 'yes',
  attachments: [],
  employment_contract: [],
  payslip: [],
  youth_application_id: 'youth-app-1',
};

export const mockVoucher2: HandlerSummerVoucher = {
  id: 'voucher-2',
  summer_voucher_serial_number: 'SN-002',
  employee_name: 'Matti Meikäläinen',
  employee_birthdate: '2005-06-15',
  employee_school: 'Ammattikoulu',
  employee_phone_number: '0501234567',
  employee_home_city: 'Espoo',
  employee_postcode: '02100',
  employment_postcode: '00200',
  employment_start_date: '2024-07-01',
  employment_end_date: '2024-07-31',
  employment_work_hours: 60,
  employment_salary_paid: 500,
  employment_description: 'Kahvilatyöntekijä',
  hired_without_voucher_assessment: 'no',
  attachments: [],
  employment_contract: [],
  payslip: [],
};

export const mockApplicationSingleVoucher: HandlerEmployerApplication = {
  id: 'app-1',
  status: 'submitted',
  submitted_at: '2024-05-15',
  created_at: '2024-05-10',
  company: {
    id: 'company-1',
    name: 'Testiyritys Oy',
    business_id: '1234567-8',
    industry: 'Palvelut',
    company_form: 'oy',
    street_address: 'Testikatu 1',
    postcode: '00100',
    city: 'Helsinki',
  },
  contact_person_name: 'Testi Henkilö',
  contact_person_email: 'testi@yritys.fi',
  contact_person_phone_number: '0401112222',
  street_address: 'Laskutuskatu 2',
  bank_account_number: 'FI1234567890123456',
  is_separate_invoicer: false,
  invoicer_name: '',
  invoicer_email: '',
  invoicer_phone_number: '',
  language: 'fi',
  summer_vouchers: [mockVoucher1],
};

export const mockApplicationTwoVouchers: HandlerEmployerApplication = {
  ...mockApplicationSingleVoucher,
  id: 'app-2',
  summer_vouchers: [mockVoucher1, mockVoucher2],
};
