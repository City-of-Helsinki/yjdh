import Attachment from 'shared/types/attachment';

import {
  APPLICATION_FIELDS_STEP1_KEYS,
  APPLICATION_FIELDS_STEP2_KEYS,
  BENEFIT_TYPES,
  DE_MINIMIS_AID_KEYS,
  EMPLOYEE_KEYS,
  ORGANIZATION_TYPES,
  SUPPORTED_LANGUAGES,
} from '../constants';

export type EmployeeData = {
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
};

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

export type CompanyData = {
  id?: string;
  name: string;
  business_id: string;
  company_form: string;
  street_address: string;
  postcode: string;
  city: string;
  bank_account_number: string;
  organization_type: string;
};

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

export type BaseData = {
  identifier: string;
};

export type DeMinimisAidData = {
  id?: string;
  granter: string;
  granted_at: string;
  amount: number;
  ordering?: number;
};

export type DeMinimisAid = {
  [DE_MINIMIS_AID_KEYS.GRANTER]?: string;
  [DE_MINIMIS_AID_KEYS.AMOUNT]?: number | '';
  [DE_MINIMIS_AID_KEYS.GRANTED_AT]?: string;
};

export type AttachmentData = {
  id?: string;
  application: string;
  attachment_type: ATTACHMENT_TYPES;
  attachment_file: string;
  attachment_file_name: string;
  content_type: ATTACHMENT_CONTENT_TYPES;
  created_at?: string;
};

export type ApplicantConsentData = {
  id: string;
  text_fi: string;
  text_en: string;
  text_sv: string;
};

export type ApplicantConsent = {
  id: string;
  textFi: string;
  textEn: string;
  textSv: string;
};

export type ApplicantTermsData = {
  id: string;
  applicant_consents: ApplicantConsentData[];
  effective_from: string;
  terms_pdf_en: string;
  terms_pdf_fi: string;
  terms_pdf_sv: string;
  terms_type?: ATTACHMENT_TYPES;
};

export type ApplicantTerms = {
  applicantConsents: ApplicantConsent[];
  effectiveFrom: string;
  id: string;
  termsPdfEn: string;
  termsPdfFi: string;
  termsPdfSv: string;
  termsType: ATTACHMENT_TYPES;
};

export type ApplicantTermsApprovalData = {
  id: string;
  approved_at: string;
  approved_by: string;
  terms: ApplicantTermsData[];
};

export type ApplicantTermsApproval = {
  id: string;
  approvedAt: string;
  approvedBy: string;
  terms?: ApplicantTerms;
};

export type ApproveTermsData = {
  terms: string;
  selected_applicant_consents: string[];
};

export type ApproveTerms = {
  terms: string;
  selectedApplicantConsents: string[];
};

// handler

export type RowData = {
  row_type: string;
  ordering: number;
  description_fi: string;
  amount: string;
};

export type HandlerDetailsData = {
  id?: string;
  first_name: string;
  last_name: string;
  terms_of_service_approvals: ApplicantTermsApprovalData;
};

export type CalculationData = {
  id?: string;
  monthly_pay: string;
  vacation_money: string;
  other_expenses: string;
  start_date: string;
  end_date: string;
  state_aid_max_percentage?: number;
  granted_as_de_minimis_aid: boolean;
  target_group_check: boolean;
  calculated_benefit_amount: string;
  override_benefit_amount: string;
  override_benefit_amount_comment?: string;
  rows: RowData[];
  handler_details: HandlerDetailsData;
};

export type ApplicationData = {
  id?: string;
  status: APPLICATION_STATUSES; // required
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
  created_at?: string;
  application_step?: string;
  applicant_terms_approval?: ApplicantTermsApprovalData;
  applicant_terms_approval_needed?: boolean;
  applicant_terms_in_effect?: ApplicantTermsData;
  approve_terms?: ApproveTermsData;
  calculation?: CalculationData;
  submitted_at?: string;
};

export type ApplicationListItemData = {
  id: string;
  companyName?: string;
  companyId?: string;
  submittedAt?: string;
  applicationNum?: number;
  employeeName?: string;
  handlerName?: string;
};

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

// handler

export type Row = {
  rowType: string;
  ordering: number;
  descriptionFi: string;
  amount: string;
};

export type HandlerDetails = {
  id?: string;
  firstName: string;
  lastName: string;
  termsOfServiceApprovals: ApplicantTermsApproval;
};

export type Calculation = {
  id?: string;
  monthlyPay: string;
  vacationMoney: string;
  otherExpenses: string;
  startDate: string;
  endDate: string;
  stateAidMaxPercentage?: number;
  grantedAsDeMinimisAid: boolean;
  targetGroupCheck: boolean;
  calculatedBenefitAmount: string;
  overrideBenefitAmount: string;
  overrideBenefitAmountComment?: string;
  rows: Row[];
  handlerDetails: HandlerDetails;
};

export type Application = {
  id?: string;
  status?: APPLICATION_STATUSES;
  applicationNumber?: number;
  bases?: string[];
  company?: Company;
  archived?: boolean;
  createdAt?: string | null;
  applicationStep?: string | null;
  attachments?: Attachment[];
  // create_application_for_company ? not present in the UI?
  applicantTermsApproval?: ApplicantTermsApproval;
  applicantTermsApprovalNeeded?: boolean;
  applicantTermsInEffect?: ApplicantTerms;
  approveTerms?: ApproveTerms;
  calculation?: Calculation;
  submittedAt?: string;
} & Step1 &
  Step2;

export type SubmittedApplication = {
  applicationNumber: number;
  applicantName: string;
};

export interface ApplicationReviewViewProps {
  data: Application;
}
