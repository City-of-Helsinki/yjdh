import {
  APPLICATION_FIELDS_STEP1_KEYS,
  APPLICATION_FIELDS_STEP2,
  APPLICATION_FIELDS_STEP2_KEYS,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';

export const IS_CLIENT = typeof window !== 'undefined';

export enum ROUTES {
  HOME = '/',
  APPLICATION_FORM = '/application',
  LOGIN = '/login',
  TERMS_OF_SERVICE = '/terms-of-service',
  ACCESSIBILITY_STATEMENT = '/accessibility-statement',
  COOKIE_SETTINGS = '/cookie-settings',
}

export const MAX_DEMINIMIS_AID_TOTAL_AMOUNT = 200_000;

export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export const DEFAULT_APPLICATION_STEP = 'step_1' as const;

export enum APPLICATION_SAVE_ACTIONS {
  SAVE_AND_NEXT = 'save_next',
  SAVE_AND_PREVIOUS = 'save_prev',
  SAVE_AND_CONTINUE_LATER = 'save_later',
}

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.FI;

export const COMMON_I18N_NAMESPACES = ['common'] as const;

export const PRIVACY_POLICY_LINKS = {
  fi: 'https://www.hel.fi/1',
  en: 'https://www.hel.fi/2',
  sv: 'https://www.hel.fi/3',
} as const;

export const DE_MINIMIS_AID_GRANTED_AT_MAX_DATE = new Date();

// Set the minimum date of the deMinimimis aid granted at datepicker to the beginning of the year 4 years ago
export const DE_MINIMIS_AID_GRANTED_AT_MIN_DATE = new Date(
  new Date().getFullYear() - 4,
  0,
  1
);

export const APPLICATION_START_DATE = new Date(new Date().getFullYear(), 0, 1);

export const APPLICATION_INITIAL_VALUES = {
  status: APPLICATION_STATUSES.DRAFT,
  employee: {
    [APPLICATION_FIELDS_STEP2.employee.FIRST_NAME]: '',
    [APPLICATION_FIELDS_STEP2.employee.LAST_NAME]: '',
    [APPLICATION_FIELDS_STEP2.employee.SOCIAL_SECURITY_NUMBER]: '',
    // [APPLICATION_FIELDS_STEP2.employee.EMPLOYEE_IS_LIVING_IN_HELSINKI]: false,
    [APPLICATION_FIELDS_STEP2.employee.JOB_TITLE]: '',
    [APPLICATION_FIELDS_STEP2.employee.WORKING_HOURS]: '' as const,
    [APPLICATION_FIELDS_STEP2.employee.COLLECTIVE_BARGAINING_AGREEMENT]: '',
    [APPLICATION_FIELDS_STEP2.employee.MONTHLY_PAY]: '' as const,
    [APPLICATION_FIELDS_STEP2.employee.OTHER_EXPENSES]: '' as const,
    [APPLICATION_FIELDS_STEP2.employee.VACATION_MONEY]: '' as const,
    [APPLICATION_FIELDS_STEP2.employee.COMMISSION_DESCRIPTION]: '',
    [APPLICATION_FIELDS_STEP2.employee.EMPLOYEE_COMMISSION_AMOUNT]: '' as const,
  },
  bases: [],
  [APPLICATION_FIELDS_STEP1_KEYS.USE_ALTERNATIVE_ADDRESS]: false,
  [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_CITY]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.ALTERNATIVE_COMPANY_POSTCODE]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_FIRST_NAME]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_LAST_NAME]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_CONTACT_PERSON_EMAIL]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.APPLICANT_LANGUAGE]: SUPPORTED_LANGUAGES.FI,
  [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS]: null,
  [APPLICATION_FIELDS_STEP1_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]: '',
  [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID]: null,
  [APPLICATION_FIELDS_STEP1_KEYS.DE_MINIMIS_AID_SET]: [],
  [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED]: null,
  [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_PERCENT]: null,
  [APPLICATION_FIELDS_STEP2_KEYS.ADDITIONAL_PAY_SUBSIDY_PERCENT]: null,
  [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]: null,
  archived: false,
  [APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE]: '' as const,
  [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]: '',
  [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]: '',
  applicationStep: DEFAULT_APPLICATION_STEP,
};

export const EMPLOYEE_MIN_WORKING_HOURS = 18;
export const EMPLOYEE_MAX_WORKING_HOURS = 168;

export const MAX_SHORT_STRING_LENGTH = 64 as const;
export const MAX_LONG_STRING_LENGTH = 256 as const;

export const MIN_PHONE_NUMBER_LENGTH = 3 as const;
export const MAX_PHONE_NUMBER_LENGTH = 13 as const;

// temporary consent file
export const EMPLOYEE_CONSENT_FILE_PREFIX = 'employee_consent';

export const SUBMITTED_STATUSES = [
  'received',
  'handling',
  'cancelled',
  'accepted',
  'rejected',
];

export enum LOCAL_STORAGE_KEYS {
  IS_TERMS_OF_SERVICE_APPROVED = 'isTermsOfServiceApproved',
  CSRF_TOKEN = 'csrfToken',
}

export const ASKEM_SCRIPT_URL = 'https://cdn.reactandshare.com/plugin/rns.js';
export const ASKEM_HOSTNAME = 'reactandshare.com';
