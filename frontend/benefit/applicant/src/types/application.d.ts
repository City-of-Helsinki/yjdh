import { DefaultTheme } from 'styled-components';

import {
  APPLICATION_FIELDS,
  APPLICATION_STATUSES,
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
  ORGANIZATION_TYPES,
  SUPPORTED_LANGUAGES,
} from '../constants';

export interface Employee {
  id?: string;
  first_name: string;
  last_name: string;
  social_security_number: string;
  phone_number: string;
  email: string;
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

export interface Company {
  id?: string;
  name: string;
  business_id: string;
  company_form: string;
  street_address: string;
  postcode: string;
  city: string;
  bank_account_number: string;
}

export interface Base {
  identifier: string;
}

export interface DeMinimisAid {
  id?: string;
  granter: string;
  granted_at: string;
  amount: string;
  ordering?: number;
}

export interface Attachment {
  id?: string;
  application: string;
  attachment_type: ATTACHMENT_TYPES;
  attachment_file: string;
  content_type: ATTACHMENT_CONTENT_TYPES;
  created_at?: string;
}

export interface ApplicationData {
  id?: string;
  status: APPLICATION_STATUSES; // required
  application_number?: number;
  employee: Employee; // required
  company?: Company;
  company_name?: string;
  company_form?: string;
  organization_type?: ORGANIZATION_TYPES;
  submitted_at?: string;
  bases: string[]; // required
  available_bases?: Base[];
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
  de_minimis_aid_set: DeMinimisAid[]; // required
  last_modified_at?: string;
  attachments?: Attachment[];
  create_application_for_company?: string;
}

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
  [APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS]: boolean;
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET]: string;
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP]: string;
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT]: string;
  [APPLICATION_FIELDS.COMPANY_IBAN]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_PHONE]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_EMAIL]: string;
  [APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED]: string;
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING]: string;
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO]: string;
};

export type FormFieldsStep2 = {
  [APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME]: string;
  [APPLICATION_FIELDS.EMPLOYEE_LAST_NAME]: string;
  [APPLICATION_FIELDS.EMPLOYEE_SSN]: string;
  [APPLICATION_FIELDS.EMPLOYEE_PHONE]: string;
  [APPLICATION_FIELDS.IS_HELSINKI_MUNICIPALITY]: boolean;
  [APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED]: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT]: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_ADDITIONAL_PERCENT]: string;
  [APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM]: string;
  [APPLICATION_FIELDS.BENEFIT_TYPE]: string;
  [APPLICATION_FIELDS.JOB_TITLE]: string;
  [APPLICATION_FIELDS.WORKING_HOURS]: string;
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_AGREEMENT]: string;
  [APPLICATION_FIELDS.MONTHLY_PAY]: string;
  [APPLICATION_FIELDS.OTHER_EXPENSES]: string;
  [APPLICATION_FIELDS.VACATION_MONEY]: string;
  [APPLICATION_FIELDS.COMMISSION_DESCRIPTION]: string;
  [APPLICATION_FIELDS.COMMISSION_AMOUNT]: string;
};

export interface NewApplicationData {
  status?: APPLICATION_STATUSES;
}
