import { friendlyFormatIBAN } from 'ibantools';

import { ApplicationFormData } from '../types';

export type ApplicationField = {
  testId: string;
  value?: string | null;
};

const formatFloatToCurrency = (
  value: string | number,
  currency: 'EUR' | null = 'EUR',
  locale = 'fi-FI'
): string => {
  const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
  const currencyOptions = currency
    ? {
        style: 'currency' as const,
        currency,
      }
    : {};

  return parsedValue.toLocaleString(locale, {
    minimumFractionDigits: 2,
    ...currencyOptions,
  });
};

export const mapRequiredForm = (
  form: ApplicationFormData
): ApplicationField[] => [
  {
    testId: 'application-field-companyBankAccountNumber',
    value: friendlyFormatIBAN(`FI${form.organization.iban}`),
  },
  {
    testId: 'application-field-companyContactPersonFirstName',
    value: form.organization.firstName,
  },
  {
    testId: 'application-field-companyContactPersonLastName',
    value: form.organization.lastName,
  },
  {
    testId: 'application-field-companyContactPersonPhoneNumber',
    value: form.organization.phone,
  },
  {
    testId: 'application-field-companyContactPersonEmail',
    value: form.organization.email,
  },
  { testId: 'application-field-applicantLanguage', value: 'Suomi' },
  {
    testId: 'application-field-coOperationNegotiations',
    value: null,
  },
  { testId: 'application-field-firstName', value: form.employee.firstName },
  { testId: 'application-field-lastName', value: form.employee.lastName },
  {
    testId: 'application-field-socialSecurityNumber',
    value: form.employee.ssn,
  },
  { testId: 'application-field-isLivingInHelsinki', value: 'Kyllä' },
  { testId: 'application-field-jobTitle', value: form.employee.title },
  {
    testId: 'application-field-collectiveBargainingAgreement',
    value: form.employee.collectiveBargainingAgreement,
  },
  {
    testId: 'application-field-workingHours',
    value: form.employee.workHours,
  },
  {
    testId: 'application-field-monthlyPay',
    value: formatFloatToCurrency(form.employee.monthlyPay),
  },
  {
    testId: 'application-field-vacationMoney',
    value: formatFloatToCurrency(form.employee.vacationMoney),
  },
  {
    testId: 'application-field-otherExpenses',
    value: formatFloatToCurrency(form.employee.otherExpenses),
  },
  { testId: 'application-field-paySubsidyGranted', value: 'Palkkatuki' },
  { testId: 'application-field-apprenticeshipProgram', value: null },
  { testId: 'application-field-startDate', value: form.employee.startDate },
  { testId: 'application-field-endDate', value: form.employee.endDate },
  { testId: 'attachment-employment_contract', value: null },
  { testId: 'attachment-employee_consent', value: null },
];

export const mapNoDeMinimisAid = [
  {
    name: 'application-field-deMinimisAidsNo',
    value: null,
  },
];

// TODO: testId: 'application-field-alternativeCompanyStreetAddress'
export const mapFullForm = (form: ApplicationFormData): ApplicationField[] => [
  {
    testId: 'application-field-deMinimisAidsAmount',
    value: form.deMinimisAid.amount,
  },
  {
    testId: 'application-field-coOperationNegotiationsDescription',
    value: form.organization.coOperationNegotiationsDescription,
  },
  { testId: 'attachment-education_contract', value: null },
  { testId: 'attachment-helsinki_benefit_voucher', value: null },
];
