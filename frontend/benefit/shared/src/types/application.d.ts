import { Language } from 'shared/i18n/i18n';
import { BenefitAttachment } from 'shared/types/attachment';
import { DefaultTheme } from 'styled-components';

import {
  APPLICATION_FIELDS_STEP1_KEYS,
  APPLICATION_FIELDS_STEP2_KEYS,
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
  CALCULATION_EMPLOYMENT_KEYS,
  DE_MINIMIS_AID_KEYS,
  EMPLOYEE_KEYS,
  MESSAGE_TYPES,
  ORGANIZATION_TYPES,
  PAY_SUBSIDY_OPTIONS,
  PROPOSALS_FOR_DESISION,
} from '../constants';

// handler

export type BatchData = {
  id: string;
  status: APPLICATION_STATUSES;
  applications: string[];
  proposal_for_decision: PROPOSALS_FOR_DESISION;
  decision_maker_title?: string;
  decision_maker_name?: string;
  section_of_the_law?: string;
  decision_date?: string;
  expert_inspector_name?: string;
  expert_inspector_email?: string;
  created_at: string;
};

interface ApplicationAllowedAction {
  label: string;
  handleAction: () => void;
  Icon?: React.FC;
}

export type HandlerDetailsData = {
  id?: string;
  first_name: string;
  last_name: string;
  terms_of_service_approvals: ApplicantTermsApprovalData;
};

export type RowData = {
  id?: string;
  row_type: string;
  ordering: number;
  description_fi: string;
  amount: string;
};

export type MessageData = {
  id?: string;
  created_at?: string;
  modified_at?: string;
  content: string;
  message_type: MESSAGE_TYPES;
  sender?: string;
};

export type Message = {
  id?: string;
  createdAt?: string;
  modifiedAt?: string;
  content: string;
  messageType: MESSAGE_TYPES;
  sender?: string;
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

export type ApplicantConsent = {
  id: string;
  textFi: string;
  textEn: string;
  textSv: string;
};

export type ApplicantTermsApproval = {
  id: string;
  approvedAt: string;
  approvedBy: string;
  terms?: ApplicantTerms;
};

export type ApproveTerms = {
  terms: string;
  selectedApplicantConsents: string[];
};

export type Batch = {
  id: string;
  status: APPLICATION_STATUSES;
  applications: string[];
  proposalForDecision: PROPOSALS_FOR_DESISION;
  decisionMakerTitle?: string;
  decisionMakerName?: string;
  sectionOfTheLaw?: string;
  decisionDate?: string;
  expertInspectorName?: string;
  expertInspectorEmail?: string;
  createdAt: string;
};

export type HandlerDetails = {
  id?: string;
  firstName: string;
  lastName: string;
  termsOfServiceApprovals: ApplicantTermsApproval;
};

export interface CalculationCommon {
  [CALCULATION_EMPLOYMENT_KEYS.START_DATE]?: string;
  [CALCULATION_EMPLOYMENT_KEYS.END_DATE]?: string;
}

export type Calculation = {
  id?: string;
  monthlyPay: string;
  vacationMoney: string;
  otherExpenses: string;
  stateAidMaxPercentage?: number;
  grantedAsDeMinimisAid?: boolean;
  targetGroupCheck?: boolean;
  calculatedBenefitAmount: string;
  overrideMonthlyBenefitAmount: string | null;
  overrideMonthlyBenefitAmountComment?: string;
  rows: Row[];
  handlerDetails: HandlerDetails;
  durationInMonthsRounded?: string;
} & CalculationCommon;

export type DeMinimisAid = {
  [DE_MINIMIS_AID_KEYS.GRANTER]?: string;
  [DE_MINIMIS_AID_KEYS.AMOUNT]?: number | '';
  [DE_MINIMIS_AID_KEYS.GRANTED_AT]?: string;
};

export type PaySubsidy = {
  id?: string;
  startDate: string;
  endDate: string;
  paySubsidyPercent: number;
  workTimePercent?: number;
  disabilityOrIllness?: boolean;
  durationInMonthsRounded: string;
};

export type Row = {
  id: string;
  rowType: string;
  ordering: number;
  descriptionFi: string;
  amount: string;
};

export type TrainingCompensation = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyAmount: string;
};

export type PaySubsidyPercent = typeof PAY_SUBSIDY_OPTIONS[number];

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
  calculation?: Calculation;
  submittedAt?: string;
  paySubsidies?: PaySubsidy[];
  durationInMonthsRounded?: string;
  logEntryComment?: string;
  trainingCompensations?: TrainingCompensation[];
  batch?: Batch;
  handledAt?: string;
  latestDecisionComment?: string;
  unreadMessagesCount?: number;
} & Step1 &
  Step2;

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
  [APPLICATION_FIELDS_STEP1_KEYS.APPLICANT_LANGUAGE]?: Language | '';
  [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS]?: boolean | null;
  [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]?: string;
  [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID]?: boolean | null;
  [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID_SET]?: DeMinimisAid[];
}

export interface Step2 {
  [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED]?: boolean | null;
  [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_PERCENT]?: PaySubsidyPercent | null;
  [APPLICATION_FIELDS_STEP2_KEYS.ADDITIONAL_PAY_SUBSIDY_PERCENT]?: PaySubsidyPercent | null;
  [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]?: boolean | null;
  [APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE]?: BENEFIT_TYPES | '';
  [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]?: string | '';
  [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]?: string | '';
  [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE]?: Employee;
}

export interface ApplicantTermsApprovalData {
  id: string;
  approved_at: string;
  approved_by: string;
  terms?: ApplicantTermsData;
}

export interface ApproveTermsData {
  terms: string;
  selected_applicant_consents: string[];
}

export type DeMinimisAidData = {
  id?: string;
  granter: string;
  granted_at: string;
  amount: number;
  ordering?: number;
};

export type CalculationData = {
  id?: string;
  monthly_pay: number;
  vacation_money: number;
  other_expenses: number;
  start_date: string;
  end_date: string;
  state_aid_max_percentage?: number;
  granted_as_de_minimis_aid: boolean;
  target_group_check: boolean;
  calculated_benefit_amount: string;
  override_monthly_benefit_amount: number;
  override_monthly_benefit_amount_comment?: string;
  rows: RowData[];
  handler_details: HandlerDetailsData;
  duration_in_months_rounded: string;
};

export type PaySubsidyData = {
  id?: string;
  start_date: string;
  end_date: string;
  pay_subsidy_percent: PaySubsidyPercent;
  work_time_percent?: number;
  disability_or_illness?: boolean;
  duration_in_months_rounded: string;
};

export type ApplicationData = {
  id?: string;
  status?: APPLICATION_STATUSES;
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
  pay_subsidy_percent?: PaySubsidyPercent;
  additional_pay_subsidy_percent?: PaySubsidyPercent;
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
  applicant_terms_approval?: ApplicantTermsApprovalData;
  applicant_terms_approval_needed?: boolean;
  applicant_terms_in_effect?: ApplicantTermsData;
  approve_terms?: ApproveTermsData;
  calculation?: CalculationData;
  pay_subsidies?: PaySubsidyData[];
  duration_in_months_rounded?: string;
  log_entry_comment?: string;
  training_compensations: TrainingCompensationData[];
  handled_at?: string;
  batch?: BatchData;
  latest_decision_comment?: string;
  unread_messages_count?: number;
};

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
  employee_language?: SUPPORTED_LANGUAGES;
  [EMPLOYEE_KEYS.JOB_TITLE]?: string;
  [EMPLOYEE_KEYS.MONTHLY_PAY]?: string;
  [EMPLOYEE_KEYS.VACATION_MONEY]?: string;
  [EMPLOYEE_KEYS.OTHER_EXPENSES]?: string;
  [EMPLOYEE_KEYS.WORKING_HOURS]?: string;
  [EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT]?: string;
  [EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI]?: boolean;
  [EMPLOYEE_KEYS.EMPLOYEE_COMMISSION_AMOUNT]?: string;
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
  organization_type: ORGANIZATION_TYPES;
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

export type ApplicationListItemData = {
  id: string;
  name?: string;
  avatar?: {
    initials: string;
    color: keyof DefaultTheme['colors'];
  };
  status?: APPLICATION_STATUSES;
  statusText?: string;
  companyName?: string;
  companyId?: string;
  createdAt?: string;
  modifiedAt?: string;
  editEndDate?: string;
  submittedAt?: string;
  handledAt?: string;
  applicationNum?: number;
  employeeName?: string;
  handlerName?: string;
  additionalInformationNeededBy?: string;
  allowedAction?: ApplicationAllowedAction;
  dataReceived?: string;
  unreadMessagesCount?: number;
};

export type TextProp = 'textFi' | 'textEn' | 'textSv';
export type TermsProp = 'termsPdfFi' | 'termsPdfEn' | 'termsPdfSv';

export type ApplicantConsentsData = {
  id: string;
  text_fi: string;
  text_en: string;
  text_sv: string;
};

export type TermsOfServiceInEffectData = {
  id: string;
  terms_pdf_fi: string;
  terms_pdf_en: string;
  terms_pdf_sv: string;
  applicant_consents: ApplicantConsentsData[];
};

export type UserData = {
  id: string;
  first_name: string;
  last_name: string;
  terms_of_service_approval_needed: boolean;
  terms_of_service_in_effect: TermsOfServiceInEffectData;
};

export type ApplicantConsents = {
  id: string;
  textFi: string;
  textEn: string;
  textSv: string;
};

export type TermsOfServiceInEffect = {
  id: string;
  termsPdfFi: string;
  termsPdfEn: string;
  termsPdfSv: string;
  applicantConsents: ApplicantConsents[];
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  termsOfServiceApprovalNeeded: boolean;
  termsOfServiceInEffect: TermsOfServiceInEffect;
};

export type ApproveTermsOfServiceResponseData = {
  id: string;
  approved_at: string;
  approved_by: string;
  terms: string;
  selected_applicant_consents: string[];
};
