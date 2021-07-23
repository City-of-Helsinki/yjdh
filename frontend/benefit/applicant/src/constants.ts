export const IS_CLIENT = typeof window !== 'undefined';

export enum ROUTES {
  HOME = '/',
  APPLICATION_FORM = '/application',
}

export const MAX_DEMINIMIS_AID_TOTAL_AMOUNT = 200000;

export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export enum APPLICATION_SAVE_ACTIONS {
  SAVE_AND_NEXT = 'save_next',
  SAVE_AND_PREVIOUS = 'save_prev',
  SAVE_AND_CONTINUE_LATER = 'save_later',
}

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.FI;

export const COMMON_I18N_NAMESPACES = ['common'];

export const PRIVACY_POLICY_LINKS = {
  fi: 'https://www.hel.fi/1',
  en: 'https://www.hel.fi/2',
  sv: 'https://www.hel.fi/3',
};

export enum APPLICATION_STATUSES {
  DRAFT = 'draft',
  INFO_REQUIRED = 'additional_information_needed',
  RECEIVED = 'received',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
}

export enum ATTACHMENT_CONTENT_TYPES {
  APPLICATION_PDF = 'application/pdf',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
}

export enum APPLICATION_FIELDS_STEP1 {
  USE_ALTERNATIVE_ADDRESS = 'useAlternativeAddress',
  ALTERNATIVE_COMPANY_STREET_ADDRESS = 'alternativeCompanyStreetAddress',
  ALTERNATIVE_COMPANY_POSTCODE = 'alternativeCompanyPostcode',
  ALTERNATIVE_COMPANY_CITY = 'alternativeCompanyCity',
  COMPANY_BANK_ACCOUNT_NUMBER = 'companyBankAccountNumber',
  COMPANY_CONTACT_PERSON_FIRST_NAME = 'companyContactPersonFirstName',
  COMPANY_CONTACT_PERSON_LAST_NAME = 'companyContactPersonLastName',
  COMPANY_CONTACT_PERSON_PHONE_NUMBER = 'companyContactPersonPhoneNumber',
  COMPANY_CONTACT_PERSON_EMAIL = 'companyContactPersonEmail',
  APPLICANT_LANGUAGE = 'applicantLanguage',
  DE_MINIMIS_AID = 'deMinimisAid',
  CO_OPERATION_NEGOTIATIONS = 'coOperationNegotiations',
  CO_OPERATION_NEGOTIATIONS_DESCRIPTION = 'coOperationNegotiationsDescription',
}

export enum APPLICATION_FIELDS_STEP2 {
  EMPLOYEE_FIRST_NAME = 'firstName',
  EMPLOYEE_LAST_NAME = 'lastName',
  EMPLOYEE_SOCIAL_SECURITY_NUMBER = 'socialSecurityNumber',
  EMPLOYEE_PHONE_NUMBER = 'phoneNumber',
  EMPLOYEE_IS_LIVING_IN_HELSINKI = 'isLivingInHelsinki',
  PAY_SUBSIDY_GRANTED = 'paySubsidyGranted',
  PAY_SUBSIDY_PERCENT = 'paySubsidyPercent',
  ADDITIONAL_PAY_SUBSIDY_PERCENT = 'additionalPaySubsidyPercent',
  APPRENTICESHIP_PROGRAM = 'apprenticeshipProgram',
  BENEFIT_TYPE = 'benefitType',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  EMPLOYEE_JOB_TITLE = 'jobTitle',
  EMPLOYEE_WORKING_HOURS = 'workingHours',
  EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT = 'collectiveBargainingAgreement',
  EMPLOYEE_MONTHLY_PAY = 'monthlyPay',
  EMPLOYEE_OTHER_EXPENSES = 'otherExpenses',
  EMPLOYEE_VACATION_MONEY = 'vacationMoney',
  EMPLOYEE_COMMISSION_DESCRIPTION = 'commissionDescription',
  EMPLOYEE_COMMISSION_AMOUNT = 'commissionAmount',
}

export const APPLICATION_FIELDS = {
  // step1 - Company
  ...APPLICATION_FIELDS_STEP1,
  // step2 - Employee
  ...APPLICATION_FIELDS_STEP2,
};

export const DEFAULT_APPLICATION_FIELDS_STEP2 = {
  [APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME]: '',
  [APPLICATION_FIELDS.EMPLOYEE_LAST_NAME]: '',
  [APPLICATION_FIELDS.EMPLOYEE_SOCIAL_SECURITY_NUMBER]: '',
  [APPLICATION_FIELDS.EMPLOYEE_PHONE_NUMBER]: '',
  [APPLICATION_FIELDS.EMPLOYEE_IS_LIVING_IN_HELSINKI]: false,
  [APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED]: '',
  [APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT]: '',
  [APPLICATION_FIELDS.ADDITIONAL_PAY_SUBSIDY_PERCENT]: '',
  [APPLICATION_FIELDS.APPRENTICESHIP_PROGRAM]: '',
  [APPLICATION_FIELDS.BENEFIT_TYPE]: '',
  [APPLICATION_FIELDS.EMPLOYEE_JOB_TITLE]: '',
  [APPLICATION_FIELDS.EMPLOYEE_WORKING_HOURS]: '',
  [APPLICATION_FIELDS.EMPLOYEE_COLLECTIVE_BARGAINING_AGREEMENT]: '',
  [APPLICATION_FIELDS.EMPLOYEE_MONTHLY_PAY]: '',
  [APPLICATION_FIELDS.EMPLOYEE_OTHER_EXPENSES]: '',
  [APPLICATION_FIELDS.EMPLOYEE_VACATION_MONEY]: '',
  [APPLICATION_FIELDS.EMPLOYEE_COMMISSION_DESCRIPTION]: '',
  [APPLICATION_FIELDS.EMPLOYEE_COMMISSION_AMOUNT]: '',
};

export enum DE_MINIMIS_AID_FIELDS {
  GRANTER = 'granter',
  AMOUNT = 'amount',
  GRANTED_AT = 'grantedAt',
}

export const DEFAULT_APPLICATION = {
  status: APPLICATION_STATUSES.DRAFT,
  employee: {},
  bases: [],
  [APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS]: false,
  archived: false,
  deMinimisAidSet: [],
  currentStep: 1,
};

export const PAY_SUBSIDY_OPTIONS = ['30', '40', '50', '100'];

export enum VALIDATION_MESSAGE_KEYS {
  REQUIRED = 'common:form.validation.required',
  EMAIL = 'common:form.validation.string.email',
  IBAN_INVALID = 'common:form.validation.iban.invalid',
  NUMBER_MIN = 'common:form.validation.number.min',
  NUMBER_MAX = 'common:form.validation.number.max',
  STRING_POSITIVENUMBER = 'common:form.validation.string.positiveNumber',
  STRING_MIN = 'common:form.validation.string.min',
  STRING_MAX = 'common:form.validation.string.max',
  URL = 'common:form.validation.string.url',
  DATE = 'common:form.validation.string.date',
  DATE_IN_THE_FUTURE = 'common:form.validation.date.mustNotInThePast',
  DATE_MIN = 'common:form.validation.date.min',
  DATE_MAX = 'common:form.validation.date.max',
  DATE_FORMAT = 'common:form.validation.date.format',
  TIME = 'common:form.validation.string.time',
  TIME_MIN = 'common:form.validation.time.min',
  TIME_MAX = 'common:form.validation.time.max',
}

export const dateRegex = /(?:(?:0?[1-9]|1\d|2\d)\.(?:0?[1-9]|1[0-2])|(?:30\.(?!02)(?:0[1-9]|1[0-2]))|(?:31\.(?:0[13578]|1[02])))\.(?:19|20)\d{2}/;
