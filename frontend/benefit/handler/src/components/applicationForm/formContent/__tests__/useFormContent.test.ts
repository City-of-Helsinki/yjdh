import '@testing-library/jest-dom';
import '../../../../../test/i18n/i18n-test';

import { renderHook } from '@testing-library/react';
import {
  APPLICATION_FIELD_KEYS,
  SUPPORTED_LANGUAGES,
} from 'benefit/handler/constants';
import DeMinimisContext from 'benefit/handler/context/DeMinimisContext';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import { EMPLOYEE_KEYS } from 'benefit-shared/constants';
import { getErrorText } from 'benefit-shared/utils/forms';
import { FormikProps } from 'formik';
import React from 'react';
import { getLanguageOptions } from 'shared/utils/common';

import { useFormContent } from '../useFormContent';

jest.mock('benefit-shared/utils/forms', () => ({
  getErrorText: jest.fn(),
}));

jest.mock('shared/utils/common', () => ({
  getLanguageOptions: jest.fn(() => [
    { label: 'Suomi', value: 'fi' },
    { label: 'English', value: 'en' },
  ]),
}));

jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));

type UseFormContentResult = {
  result: {
    current: ReturnType<typeof useFormContent>;
  };
};

const makeField = (name: string): { name: string } => ({ name });

const mockFields = {
  [APPLICATION_FIELD_KEYS.COMPANY_DEPARTMENT]: makeField('companyDepartment'),
  [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS]: makeField(
    'alternativeCompanyStreetAddress'
  ),
  [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_POSTCODE]: makeField(
    'alternativeCompanyPostcode'
  ),
  [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_CITY]: makeField(
    'alternativeCompanyCity'
  ),
  [APPLICATION_FIELD_KEYS.DE_MINIMIS_AID]: makeField('deMinimisAid'),
  [APPLICATION_FIELD_KEYS.BENEFIT_TYPE]: makeField('benefitType'),
  [APPLICATION_FIELD_KEYS.START_DATE]: makeField('startDate'),
  [APPLICATION_FIELD_KEYS.END_DATE]: makeField('endDate'),
  [APPLICATION_FIELD_KEYS.EMPLOYEE]: {
    [EMPLOYEE_KEYS.COMMISSION_DESCRIPTION]: makeField('commissionDescription'),
    [EMPLOYEE_KEYS.EMPLOYEE_COMMISSION_AMOUNT]: makeField('commissionAmount'),
    [EMPLOYEE_KEYS.JOB_TITLE]: makeField('jobTitle'),
    [EMPLOYEE_KEYS.WORKING_HOURS]: makeField('workingHours'),
    [EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT]: makeField(
      'collectiveBargainingAgreement'
    ),
    [EMPLOYEE_KEYS.MONTHLY_PAY]: makeField('monthlyPay'),
    [EMPLOYEE_KEYS.OTHER_EXPENSES]: makeField('otherExpenses'),
    [EMPLOYEE_KEYS.VACATION_MONEY]: makeField('vacationMoney'),
  },
} as unknown as ApplicationFields;

const mockSetFieldValue = jest.fn();
const mockSetDeMinimisAids = jest.fn();

const makeFormik = (
  values: Partial<Application> = {}
): FormikProps<Partial<Application>> =>
  ({
    touched: {},
    errors: {},
    values,
    setFieldValue: mockSetFieldValue,
  } as unknown as FormikProps<Partial<Application>>);

const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element =>
  React.createElement(
    DeMinimisContext.Provider,
    {
      value: {
        deMinimisAids: [],
        setDeMinimisAids: mockSetDeMinimisAids,
        unfinishedDeMinimisAidRow: false,
        setUnfinishedDeMinimisAidRow: jest.fn(),
      },
    },
    children
  );

const setup = (values: Partial<Application> = {}): UseFormContentResult =>
  renderHook(() => useFormContent(makeFormik(values), mockFields), {
    wrapper,
  }) as UseFormContentResult;

// Formats a Date as d.M.yyyy for formik values
const toDateString = (date: Date): string =>
  `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

const monthsAgo = (n: number): Date => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

describe('useFormContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns static values correctly', () => {
    const { result } = setup();

    expect(result.current.translationsBase).toBe(
      'common:applications.sections'
    );
    expect(result.current.cbPrefix).toBe('application_consent');
    expect(result.current.language).toBe(SUPPORTED_LANGUAGES.FI);
    expect(result.current.textLocale).toBe('Fi');
  });

  it('returns languageOptions from getLanguageOptions', () => {
    const { result } = setup();

    expect(getLanguageOptions).toHaveBeenCalled();
    expect(result.current.languageOptions).toEqual([
      { label: 'Suomi', value: 'fi' },
      { label: 'English', value: 'en' },
    ]);
  });

  it('returns dateInputLimits with min ~1 year ago and max ~2 years ahead', () => {
    const { result } = setup();
    const now = new Date();
    const { min, max } = result.current.dateInputLimits;

    expect(min.getFullYear()).toBe(now.getFullYear() - 1);
    expect(max.getFullYear()).toBe(now.getFullYear() + 2);
  });

  it('clearAlternativeAddressValues clears all alternative address fields', () => {
    const { result } = setup();

    result.current.clearAlternativeAddressValues();

    expect(mockSetFieldValue).toHaveBeenCalledWith('companyDepartment', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith(
      'alternativeCompanyStreetAddress',
      ''
    );
    expect(mockSetFieldValue).toHaveBeenCalledWith(
      'alternativeCompanyPostcode',
      ''
    );
    expect(mockSetFieldValue).toHaveBeenCalledWith(
      'alternativeCompanyCity',
      ''
    );
  });

  it('clearDeminimisAids resets context and clears the field', () => {
    const { result } = setup();

    result.current.clearDeminimisAids();

    expect(mockSetDeMinimisAids).toHaveBeenCalledWith([]);
    expect(mockSetFieldValue).toHaveBeenCalledWith('deMinimisAid', null);
  });

  it('clearCommissionValues clears commission description and amount', () => {
    const { result } = setup();

    result.current.clearCommissionValues();

    expect(mockSetFieldValue).toHaveBeenCalledWith('commissionDescription', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith('commissionAmount', '');
  });

  it('clearContractValues clears all contract-related employee fields', () => {
    const { result } = setup();

    result.current.clearContractValues();

    expect(mockSetFieldValue).toHaveBeenCalledWith('jobTitle', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith('workingHours', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith(
      'collectiveBargainingAgreement',
      ''
    );
    expect(mockSetFieldValue).toHaveBeenCalledWith('monthlyPay', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith('otherExpenses', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith('vacationMoney', '');
  });

  it('clearDatesValues clears start and end date fields', () => {
    const { result } = setup();

    result.current.clearDatesValues();

    expect(mockSetFieldValue).toHaveBeenCalledWith('startDate', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith('endDate', '');
  });

  it('clearBenefitValues sets benefitType to null', () => {
    const { result } = setup();

    result.current.clearBenefitValues();

    expect(mockSetFieldValue).toHaveBeenCalledWith('benefitType', null);
  });

  it('getErrorMessage delegates to getErrorText', () => {
    (getErrorText as jest.Mock).mockReturnValue('some error');
    const { result } = setup();

    const error = result.current.getErrorMessage('startDate');

    expect(getErrorText).toHaveBeenCalledWith(
      {},
      {},
      'startDate',
      expect.any(Function),
      false
    );
    expect(error).toBe('some error');
  });

  describe('displayPastApplicationDatesWarning', () => {
    it('returns false when dates are missing', () => {
      const { result } = setup();
      expect(result.current.displayPastApplicationDatesWarning()).toBe(false);
    });

    it('returns false when only startDate is provided', () => {
      const { result } = setup({ startDate: '1.1.2025' });
      expect(result.current.displayPastApplicationDatesWarning()).toBe(false);
    });

    it('returns false when both dates are within the 4-month threshold', () => {
      const recent = toDateString(monthsAgo(1));
      const { result } = setup({ startDate: recent, endDate: recent });
      expect(result.current.displayPastApplicationDatesWarning()).toBe(false);
    });

    it('returns true when startDate is more than 4 months ago', () => {
      const { result } = setup({
        startDate: toDateString(monthsAgo(5)),
        endDate: toDateString(monthsAgo(1)),
      });
      expect(result.current.displayPastApplicationDatesWarning()).toBe(true);
    });

    it('returns true when endDate is more than 4 months ago', () => {
      const { result } = setup({
        startDate: toDateString(monthsAgo(1)),
        endDate: toDateString(monthsAgo(5)),
      });
      expect(result.current.displayPastApplicationDatesWarning()).toBe(true);
    });
  });
});
