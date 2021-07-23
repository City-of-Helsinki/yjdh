import { DefaultTheme } from 'styled-components';

import {
  APPLICATION_FIELDS,
  APPLICATION_STATUSES,
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
  DE_MINIMIS_AID_FIELDS,
  ORGANIZATION_TYPES,
  SUPPORTED_LANGUAGES,
} from '../constants';

export interface EmployeeData {
  id?: string;
  first_name: string;
  last_name: string;
  social_security_number: string;
  phone_number: string;
  // email: string; does not exist in UI
  employee_language: SUPPORTED_LANGUAGES;
  job_title: string;
  monthly_pay: string;
  vacation_money: string;
  other_expenses: string;
  working_hours: string;
  collective_bargaining_agreement: string;
  is_living_in_helsinki: boolean;
  commission_amount: string;
  commission_description: string;
  created_at?: string;
}

export interface CompanyData {
  id?: string;
  name: string;
  business_id: string;
  company_form: string;
  street_address: string;
  postcode: string;
  city: string;
  bank_account_number: string;
}

export interface BaseData {
  identifier: string;
}

export interface DeMinimisAidData {
  id?: string;
  granter: string;
  granted_at: string;
  amount: string;
  ordering?: number;
}

export interface AttachmentData {
  id?: string;
  application: string;
  attachment_type: ATTACHMENT_TYPES;
  attachment_file: string;
  content_type: ATTACHMENT_CONTENT_TYPES;
  created_at?: string;
}

export type ApplicationData = {
  id?: string;
  status: APPLICATION_STATUSES; // required
  application_number?: number;
  employee: EmployeeData; // required
  company?: CompanyData;
  company_name?: string;
  company_form?: string;
  organization_type?: ORGANIZATION_TYPES;
  submitted_at?: string;
  bases: string[]; // required
  available_bases?: BaseData[];
  attachment_requirements?: string;
  available_benefit_types?: BENEFIT_TYPES;
  official_company_street_address?: string;
  official_company_city?: string;
  official_company_postcode?: string;
  use_alternative_address: boolean; // required
  alternative_company_street_address?: string;
  alternative_company_city?: string;
  alternative_company_postcode?: string;
  company_bank_account_number?: string;
  company_contact_person_phone_number?: string;
  company_contact_person_email?: string;
  association_has_business_activities?: boolean;
  applicant_language?: SUPPORTED_LANGUAGES;
  co_operation_negotiations?: boolean;
  co_operation_negotiations_description?: string;
  pay_subsidy_granted?: boolean;
  pay_subsidy_percent?: number;
  additional_pay_subsidy_percent?: number;
  apprenticeship_program?: boolean;
  archived: boolean; // required
  benefit_type?: BENEFIT_TYPES;
  start_date?: string;
  end_date?: string;
  de_minimis_aid?: boolean;
  de_minimis_aid_set: DeMinimisAidData[]; // required
  last_modified_at?: string;
  attachments?: AttachmentData[];
  create_application_for_company?: string;
};

interface ApplicationAllowedAction {
  label: string;
  handleAction: () => void;
  Icon?: React.FC;
}

export interface ApplicationListItemData {
  id: string;
  name: string;
  avatar: {
    initials: string;
    color: keyof DefaultTheme['colors'];
  };
  statusText?: string;
  modifiedAt?: string;
  submittedAt?: string;
  applicationNum?: number;
  allowedAction: ApplicationAllowedAction;
}

export type FormFieldsStep1 = {
  [APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS]: boolean;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS]: string;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE]: string;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY]: string;
  [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME]: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME]: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL]: string;
  [APPLICATION_FIELDS.APPLCANT_LANGUAGE]: SUPPORTED_LANGUAGES;
  [APPLICATION_FIELDS.DE_MINIMIS_AID]: string; // boolean (radio in the application form)
  [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS]: string; // boolean co_operation_negotiations
  [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]: string; // co_operation_negotiations_description
};

export type FormFieldsStep2 = {
  [APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME]: string;
  [APPLICATION_FIELDS.EMPLOYEE_LAST_NAME]: string;
  [APPLICATION_FIELDS.EMPLOYEE_SOCIAL_SECURITY_NUMBER]: string;
  [APPLICATION_FIELDS.EMPLOYEE_PHONE_NUMBER]: string;
  [APPLICATION_FIELDS.EMPLOYEE_IS_LIVING_IN_HELSINKI]: boolean;
  [APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED]: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT]: string;
  [APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT]: string;
  [APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM]: string;
  [APPLICATION_FIELDS.BENEFIT_TYPE]: string;
  [APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE]: string;
  [APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS]: string;
  [APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT]: string;
  [APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY]: string;
  [APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES]: string;
  [APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY]: string;
  [APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION]: string;
  [APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT]: string;
};

export type DeMinimisAid = {
  [DE_MINIMIS_AID_FIELDS.GRANTER]: string;
  [DE_MINIMIS_AID_FIELDS.AMOUNT]: number;
  [DE_MINIMIS_AID_FIELDS.GRANTED_AT]: string;
};

export type Employee = {
  id?: string;
  [APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_LAST_NAME]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_SOCIAL_SECURITY_NUMBER]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_PHONE_NUMBER]?: string;
  // [APPLICATION_FIELDS.EMPLOYEE_EMAIL]?: string; does not exist in UI but in model
  // employee language: does not exist in UI but in model
  [APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_IS_LIVING_IN_HELSINKI]?: boolean;
  [APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT]?: string;
  [APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION]?: string;
};

export type Application = {
  id?: string;
  status?: APPLICATION_STATUSES;
  applicationNumber?: number;
  employee?: Employee;
  bases?: string[];
  [APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS]?: boolean;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS]?: string;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY]?: string;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE]?: string;
  [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL]?: string;
  // association_has_business_activities: boolean ? not present in the UI?
  [APPLICATION_FIELDS.APPLICANT_LANGUAGE]?: SUPPORTED_LANGUAGES;
  [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS]?: string; // boolean co_operation_negotiations
  [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]?: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED]?: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT]?: string; // number: 30, 40, 50, 100
  [APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT]?: string; // number: 30, 40, 50, 100
  [APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM]?: string; // boolean
  archived?: boolean;
  [APPLICATION_FIELDS.BENEFIT_TYPE]?: BENEFIT_TYPES;
  [APPLICATION_FIELDS.START_DATE]?: string;
  [APPLICATION_FIELDS.END_DATE]?: string;
  [APPLICATION_FIELDS.DE_MINIMIS_AID]?: string; // boolean
  deMinimisAidSet?: DeMinimisAid[];
  // create_application_for_company ? not present in the UI?
  // for step change
  currentStep?: number;
};
