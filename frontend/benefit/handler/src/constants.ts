import { APPLICATION_STATUSES } from 'benefit-shared/constants';

export enum ROUTES {
  HOME = '/',
  // temporary urls, not defined yet
  APPLICATIONS_PROCESSED = '/processed',
  APPLICATIONS_ARCHIVE = '/archive',
  APPLICATIONS_REPORTS = '/reports',
}

export enum EXPORT_APPLICATIONS_ROUTES {
  ACCEPTED = 'export_new_accepted_applications',
  REJECTED = 'export_new_rejected_applications',
  IN_TIME_RANGE = 'export',
}

export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export enum PROPOSALS_FOR_DESISION {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.FI;

export const COMMON_I18N_NAMESPACES = ['common'] as const;

export const PRIVACY_POLICY_LINKS = {
  fi: 'https://www.hel.fi/1',
  en: 'https://www.hel.fi/2',
  sv: 'https://www.hel.fi/3',
} as const;

export enum EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS {
  START_DATE = 'startDate',
  END_DATE = 'endDate',
}

export enum CALCULATION_SALARY_KEYS {
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  MONTHLY_PAY = 'monthlyPay',
  OTHER_EXPENSES = 'otherExpenses',
  VACATION_MONEY = 'vacationMoney',
  STATE_AID_MAX_PERCENTAGE = 'stateAidMaxPercentage',
  PAY_SUBSIDY_PERCENT = 'paySubsidyPercent',
  OVERRIDE_MONTHLY_BENEFIT_AMOUNT = 'overrideMonthlyBenefitAmount',
  OVERRIDE_MONTHLY_BENEFIT_AMOUNT_COMMENT = 'overrideMonthlyBenefitAmountComment',
  // eslint-disable-next-line no-secrets/no-secrets
  WORK_TIME_PERCENT = 'workTimePercent',
  PAY_SUBSIDIES = 'paySubsidies',
  TRAINING_COMPENSATIONS = 'trainingCompensations',
  MONTHLY_AMOUNT = 'monthlyAmount',
}

export const STATE_AID_MAX_PERCENTAGE_OPTIONS = [50, 100];

export const CALCULATION_SUMMARY_ROW_TYPES = [
  'state_aid_max_monthly_eur',
  'pay_subsidy_monthly_eur',
  'helsinki_benefit_total_eur',
];

export const CALCULATION_DESCRIPTION_ROW_TYPES = ['description'];

export const CALCULATION_TOTAL_ROW_TYPE = 'helsinki_benefit_total_eur';

export enum CALCULATION_TYPES {
  SALARY = 'salary',
  EMPLOYMENT = 'employment',
}

export const HANDLED_STATUSES: APPLICATION_STATUSES[] = [
  APPLICATION_STATUSES.ACCEPTED,
  APPLICATION_STATUSES.REJECTED,
  APPLICATION_STATUSES.CANCELLED,
];
