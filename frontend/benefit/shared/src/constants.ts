export enum MESSAGE_TYPES {
  NOTE = 'note',
  HANDLER_MESSAGE = 'handler_message',
  APPLICANT_MESSAGE = 'applicant_message',
}

export enum MESSAGE_URLS {
  MESSAGES = 'messages',
  NOTES = 'notes',
}

export enum VALIDATION_MESSAGE_KEYS {
  REQUIRED = 'common:form.validation.required',
  INVALID = 'common:form.validation.invalid',
  EMAIL_INVALID = 'common:form.validation.email.invalid',
  IBAN_INVALID = 'common:form.validation.iban.invalid',
  NUMBER_INVALID = 'common:form.validation.number.invalid',
  NUMBER_MIN = 'common:form.validation.number.min',
  NUMBER_MAX = 'common:form.validation.number.max',
  NUMBER_TWO_DECIMALS = 'common:form.validation.number.twoDecimals',
  PHONE_INVALID = 'common:form.validation.phone.invalid',
  STRING_POSITIVENUMBER = 'common:form.validation.string.positiveNumber',
  STRING_MIN = 'common:form.validation.string.min',
  STRING_MAX = 'common:form.validation.string.max',
  SSN_INVALID = 'common:form.validation.ssn.invalid',
  URL = 'common:form.validation.string.url',
  DATE = 'common:form.validation.string.date',
  DATE_IN_THE_FUTURE = 'common:form.validation.date.mustNotInThePast',
  DATE_MIN = 'common:form.validation.date.min',
  DATE_MAX = 'common:form.validation.date.max',
  DATE_FORMAT = 'common:form.validation.date.format',
  TIME = 'common:form.validation.string.time',
  TIME_MIN = 'common:form.validation.time.min',
  TIME_MAX = 'common:form.validation.time.max',
  REQUIRED_IS_LIVING_IN_HELSINKI = 'common:applications.sections.employee.fields.isLivingInHelsinki.error',
  PHONE_NUMBER_LENGTH_MAX = 'common:form.validation.phoneNumber.max',
}

export const PAY_SUBSIDY_OPTIONS = [50, 70, 100] as const;

export enum EMPLOYEE_KEYS {
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  SOCIAL_SECURITY_NUMBER = 'socialSecurityNumber',
  IS_LIVING_IN_HELSINKI = 'isLivingInHelsinki',
  JOB_TITLE = 'jobTitle',
  WORKING_HOURS = 'workingHours',
  COLLECTIVE_BARGAINING_AGREEMENT = 'collectiveBargainingAgreement',
  MONTHLY_PAY = 'monthlyPay',
  OTHER_EXPENSES = 'otherExpenses',
  VACATION_MONEY = 'vacationMoney',
  COMMISSION_DESCRIPTION = 'commissionDescription',
  EMPLOYEE_COMMISSION_AMOUNT = 'commissionAmount',
}

export const MAX_MONTHLY_PAY = 99_999;

export enum APPLICATION_FIELDS_STEP1_KEYS {
  USE_ALTERNATIVE_ADDRESS = 'useAlternativeAddress',
  ALTERNATIVE_COMPANY_STREET_ADDRESS = 'alternativeCompanyStreetAddress',
  ALTERNATIVE_COMPANY_POSTCODE = 'alternativeCompanyPostcode',
  ALTERNATIVE_COMPANY_CITY = 'alternativeCompanyCity',
  COMPANY_DEPARTMENT = 'companyDepartment',
  COMPANY_BANK_ACCOUNT_NUMBER = 'companyBankAccountNumber',
  ASSOCIATION_HAS_BUSINESS_ACTIVITIES = 'associationHasBusinessActivities',
  COMPANY_CONTACT_PERSON_FIRST_NAME = 'companyContactPersonFirstName',
  COMPANY_CONTACT_PERSON_LAST_NAME = 'companyContactPersonLastName',
  COMPANY_CONTACT_PERSON_PHONE_NUMBER = 'companyContactPersonPhoneNumber',
  COMPANY_CONTACT_PERSON_EMAIL = 'companyContactPersonEmail',
  APPLICANT_LANGUAGE = 'applicantLanguage',
  DE_MINIMIS_AID = 'deMinimisAid',
  DE_MINIMIS_AID_SET = 'deMinimisAidSet',
  CO_OPERATION_NEGOTIATIONS = 'coOperationNegotiations',
  CO_OPERATION_NEGOTIATIONS_DESCRIPTION = 'coOperationNegotiationsDescription',
  // ORGANIZATION_TYPE = 'organizationType',
}

export enum APPLICATION_FIELDS_STEP2_KEYS {
  ASSOCIATION_IMMEDIATE_MANAGER_CHECK = 'associationImmediateManagerCheck',
  PAY_SUBSIDY_GRANTED = 'paySubsidyGranted',
  PAY_SUBSIDY_PERCENT = 'paySubsidyPercent',
  ADDITIONAL_PAY_SUBSIDY_PERCENT = 'additionalPaySubsidyPercent',
  APPRENTICESHIP_PROGRAM = 'apprenticeshipProgram',
  BENEFIT_TYPE = 'benefitType',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  EMPLOYEE = 'employee',
}

export const APPLICATION_FIELDS_STEP2 = {
  ...APPLICATION_FIELDS_STEP2_KEYS,
  [APPLICATION_FIELDS_STEP2_KEYS.EMPLOYEE]: { ...EMPLOYEE_KEYS },
} as const;

export const APPLICATION_FIELDS = {
  // step1 - Company
  ...APPLICATION_FIELDS_STEP1_KEYS,
  // step2 - Employee
  ...APPLICATION_FIELDS_STEP2_KEYS,
} as const;

export enum DE_MINIMIS_AID_KEYS {
  GRANTER = 'granter',
  AMOUNT = 'amount',
  GRANTED_AT = 'grantedAt',
  ID = 'id',
}

export enum DE_MINIMIS_AID {
  // eslint-disable-next-line unicorn/numeric-separators-style
  MAX_AMOUNT = 200000,
}

export enum CALCULATION_EMPLOYMENT_KEYS {
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  TRAINING_COMPENSATION_START_DATE = 'trainingCompensationStartDate',
  TRAINING_COMPENSATION_END_DATE = 'trainingCompensationEndDate',
}

export enum ORGANIZATION_TYPES {
  COMPANY = 'company',
  ASSOCIATION = 'association',
}

export enum BENEFIT_TYPES {
  EMPLOYMENT = 'employment_benefit',
  SALARY = 'salary_benefit',
  COMMISSION = 'commission_benefit',
}

export enum ATTACHMENT_TYPES {
  EMPLOYMENT_CONTRACT = 'employment_contract',
  PAY_SUBSIDY_CONTRACT = 'pay_subsidy_decision',
  COMMISSION_CONTRACT = 'commission_contract',
  EDUCATION_CONTRACT = 'education_contract',
  HELSINKI_BENEFIT_VOUCHER = 'helsinki_benefit_voucher',
  EMPLOYEE_CONSENT = 'employee_consent',
  FULL_APPLICATION = 'full_application',
  OTHER_ATTACHMENT = 'other_attachment',
}

export enum APPLICATION_STATUSES {
  DRAFT = 'draft',
  INFO_REQUIRED = 'additional_information_needed',
  RECEIVED = 'received',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  HANDLING = 'handling',
}

export enum TALPA_STATUSES {
  NOT_SENT_TO_TALPA = 'not_sent_to_talpa',
  REJECTED_BY_TALPA = 'rejected_by_talpa',
  SUCCESFULLY_SENT_TO_TALPA = 'succesfully_sent_to_talpa',
}

export enum APPLICATION_ORIGINS {
  APPLICANT = 'applicant',
  HANDLER = 'handler',
}

export enum BATCH_STATUSES {
  DRAFT = 'draft',
  AWAITING_FOR_DECISION = 'awaiting_ahjo_decision',
  AHJO_REPORT_CREATED = 'exported_ahjo_report',
  DECIDED_ACCEPTED = 'accepted',
  DECIDED_REJECTED = 'rejected',
  REJECTED_BY_TALPA = 'rejected_by_talpa',
  SENT_TO_TALPA = 'sent_to_talpa',
  COMPLETED = 'completed',
}

export enum PROPOSALS_FOR_DECISION {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum PAY_SUBSIDY_GRANTED {
  GRANTED = 'granted',
  GRANTED_AGED = 'granted_aged',
  NOT_GRANTED = 'not_granted',
}

export const TRUTHY_SUBSIDIES = new Set([
  PAY_SUBSIDY_GRANTED.GRANTED,
  PAY_SUBSIDY_GRANTED.GRANTED_AGED,
]);

export const APPLICATION_START_DATE = new Date(new Date().getFullYear(), 0, 1);

export enum CALCULATION_ROW_TYPES {
  DESCRIPTION = 'description',
  SALARY_COSTS_EUR = 'salary_costs',
  STATE_AID_MAX_MONTHLY_EUR = 'state_aid_max_monthly_eur',
  PAY_SUBSIDY_MONTHLY_EUR = 'pay_subsidy_monthly_eur',
  HELSINKI_BENEFIT_MONTHLY_EUR = 'helsinki_benefit_monthly_eur',
  HELSINKI_BENEFIT_SUB_TOTAL_EUR = 'helsinki_benefit_sub_total_eur',
  HELSINKI_BENEFIT_TOTAL_EUR = 'helsinki_benefit_total_eur',
  TRAINING_COMPENSATION_MONTHLY_EUR = 'training_compensation_monthly_eur',
  DEDUCTIONS_TOTAL_EUR = 'deductions_total_eur',
}

export enum CALCULATION_ROW_DESCRIPTION_TYPES {
  DATE = 'date',
  DATE_TOTAL = 'date_total',
  DEDUCTION = 'deduction',
}

export const HELSINKI_CONSENT_COOKIE_NAME = 'city-of-helsinki-cookie-consents';
