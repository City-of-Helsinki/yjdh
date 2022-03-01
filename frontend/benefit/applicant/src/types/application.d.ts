import { BenefitAttachment } from 'shared/types/attachment';
import { DefaultTheme } from 'styled-components';

import {
  APPLICATION_FIELDS_STEP1_KEYS,
  APPLICATION_FIELDS_STEP2_KEYS,
  APPLICATION_STATUSES,
  ATTACHMENT_CONTENT_TYPES,
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
  DE_MINIMIS_AID_KEYS,
  EMPLOYEE_KEYS,
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
  monthly_pay: number;
  vacation_money: number;
  other_expenses: number;
  working_hours: number;
  collective_bargaining_agreement: string;
  is_living_in_helsinki: boolean;
  commission_amount: number;
  commission_description: string;
  created_at?: string;
}

export type Employee = {
  id?: string;
  [EMPLOYEE_KEYS.FIRST_NAME]?: string;
  [EMPLOYEE_KEYS.LAST_NAME]?: string;
  [EMPLOYEE_KEYS.SOCIAL_SECURITY_NUMBER]?: string;
  [EMPLOYEE_KEYS.PHONE_NUMBER]?: string;
  // [EMPLOYEE.EMPLOYEE_EMAIL]?: string; does not exist in UI but in model
  // employee language: does not exist in UI but in model
  [EMPLOYEE_KEYS.JOB_TITLE]?: string;
  [EMPLOYEE_KEYS.MONTHLY_PAY]?: number | '';
  [EMPLOYEE_KEYS.VACATION_MONEY]?: number | '';
  [EMPLOYEE_KEYS.OTHER_EXPENSES]?: number | '';
  [EMPLOYEE_KEYS.WORKING_HOURS]?: number | '';
  [EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT]?: string;
  [EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI]?: boolean;
  [EMPLOYEE_KEYS.EMPLOYEE_COMMISSION_AMOUNT]?: number | '';
  [EMPLOYEE_KEYS.COMMISSION_DESCRIPTION]?: string;
};

export interface CompanyData {
  id?: string;
  name: string;
  business_id: string;
  company_form: string;
  street_address: string;
  postcode: string;
  city: string;
  bank_account_number: string;
  organization_type: ORGANIZATION_TYPES;
}

export type Company = {
  id?: string;
  name: string;
  businessId: string;
  companyForm: string;
  streetAddress: string;
  postcode: string;
  city: string;
  bankAccountNumber: string;
  organizationType: ORGANIZATION_TYPES;
};

export interface BaseData {
  identifier: string;
}

export interface DeMinimisAidData {
  id?: string;
  granter: string;
  granted_at: string;
  amount: number;
  ordering?: number;
}

export type DeMinimisAid = {
  [DE_MINIMIS_AID_KEYS.GRANTER]?: string;
  [DE_MINIMIS_AID_KEYS.AMOUNT]?: number | '';
  [DE_MINIMIS_AID_KEYS.GRANTED_AT]?: string;
};

export interface AttachmentData {
  id: string;
  application: string;
  attachment_type: ATTACHMENT_TYPES;
  attachment_file: string;
  attachment_file_name: string;
  content_type: ATTACHMENT_CONTENT_TYPES;
  created_at?: string;
}

export interface ApplicantConsentData {
  id: string;
  text_fi: string;
  text_en: string;
  text_sv: string;
}

export type ApplicantConsent = {
  id: string;
  textFi: string;
  textEn: string;
  textSv: string;
};

export interface ApplicantTermsData {
  id: string;
  applicant_consents: ApplicantConsentData[];
  effective_from: string;
  terms_pdf_en: string;
  terms_pdf_fi: string;
  terms_pdf_sv: string;
  terms_type?: ATTACHMENT_TYPES;
}

export type ApplicantTerms = {
  id: string;
  applicantConsents: ApplicantConsent[];
  effectiveFrom: string;
  termsPdfEn: string;
  termsPdfFi: string;
  termsPdfSv: string;
  termsType?: ATTACHMENT_TYPES;
};

export interface ApplicantTermsApprovalData {
  id: string;
  approved_at: string;
  approved_by: string;
  terms?: ApplicantTermsData;
}

export type ApplicantTermsApproval = {
  id: string;
  approvedAt: string;
  approvedBy: string;
  terms?: ApplicantTerms;
};

export interface ApproveTermsData {
  terms: string;
  selected_applicant_consents: string[];
}

export type ApproveTerms = {
  terms: string;
  selectedApplicantConsents: string[];
};

export type ApplicationData = {
  id?: string;
  status: APPLICATION_STATUSES; // required
  additional_information_needed_by?: string;
  application_number?: number;
  application_step: string; // required
  employee: EmployeeData; // required
  company?: CompanyData;
  company_department?: string;
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
  association_immediate_manager_check?: boolean;
  applicant_language?: SUPPORTED_LANGUAGES;
  co_operation_negotiations?: boolean;
  co_operation_negotiations_description?: string;
  pay_subsidy_granted?: boolean;
  pay_subsidy_percent?: 30 | 40 | 50 | 100 | null;
  additional_pay_subsidy_percent?: 30 | 40 | 50 | 100 | null;
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
  created_at?: string;
  application_step?: string;
  applicant_terms_approval?: ApplicantTermsApprovalData;
  applicant_terms_approval_needed?: boolean;
  applicant_terms_in_effect?: ApplicantTermsData;
  approve_terms?: ApproveTermsData;
  unread_messages_count?: number;
  submitted_at?: string;
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
  status?: APPLICATION_STATUSES;
  statusText?: string;
  createdAt?: string;
  modifiedAt?: string;
  submittedAt?: string;
  applicationNum?: number;
  editEndDate?: string;
  allowedAction: ApplicationAllowedAction;
  unreadMessagesCount?: number;
}

export interface Step1 {
  [APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS]?: boolean;
  [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_DEPARTMENT]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.ORGANIZATION_TYPE]?: ORGANIZATION_TYPES | null;
  [APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES]?:
    | boolean
    | null;
  [APPLICATION_FIELDS_STEP1_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK]?:
    | boolean
    | null;
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_FIRST_NAME]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_LAST_NAME]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_EMAIL]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.APPLICANT_LANGUAGE]?: SUPPORTED_LANGUAGES | '';
  [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS]?: boolean | null;
  [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID]?: boolean | null;
  [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID_SET]?: DeMinimisAid[];
}

export interface Step2 {
  [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED]?: boolean | null;
  [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_PERCENT]?:
    | 30
    | 40
    | 50
    | 100
    | null;
  [APPLICATION_FIELDS_STEP2_KEYS.ADDITIONAL_PAY_SUBSIDY_PERCENT]?:
    | 30
    | 40
    | 50
    | 100
    | null;
  [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]?: boolean | null;
  [APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE]?: BENEFIT_TYPES | '';
  [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]?: string | '';
  [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]?: string | '';
  [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE]?: Employee;
}

export type Application = {
  id?: string;
  status?: APPLICATION_STATUSES;
  additionalInformationNeededBy?: string;
  applicationNumber?: number;
  bases?: string[];
  company?: Company;
  archived?: boolean;
  createdAt?: string | null;
  applicationStep?: string | null;
  attachments?: BenefitAttachment[];
  // create_application_for_company ? not present in the UI?
  applicantTermsApproval?: ApplicantTermsApproval;
  applicantTermsApprovalNeeded?: boolean;
  applicantTermsInEffect?: ApplicantTerms;
  approveTerms?: ApproveTerms;
  unreadMessagesCount?: number;
  submittedAt?: string | null;
} & Step1 &
  Step2;

export type TextProp = 'textFi' | 'textEn' | 'textSv';
export type TermsProp = 'termsPdfFi' | 'termsPdfEn' | 'termsPdfSv';
