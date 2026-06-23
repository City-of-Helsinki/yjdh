import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { renderHook } from '@testing-library/react';
import {
  CALCULATION_TYPES,
  PAY_SUBSIDIES_OVERRIDE,
} from 'benefit/handler/constants';
import {
  Application,
  CalculationFormProps,
} from 'benefit/handler/types/application';
import {
  PAY_SUBSIDY_GRANTED,
  PAY_SUBSIDY_PERCENT,
} from 'benefit-shared/constants';
import { getErrorText } from 'benefit-shared/utils/forms';
import { FormikProps } from 'formik';
import theme from 'shared/styles/theme';
import { focusAndScroll } from 'shared/utils/dom.utils';

import { useCalculatorData } from '../useCalculatorData';

jest.mock('benefit-shared/utils/forms', () => ({
  getErrorText: jest.fn(),
}));

jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));

jest.mock('shared/utils/dom.utils', () => ({
  focusAndScroll: jest.fn(),
}));

jest.mock('styled-components', () => {
  const actual = jest.requireActual('styled-components');

  return {
    __esModule: true,
    ...actual,
    useTheme: () => theme,
  };
});

type UseCalculatorDataResult = {
  result: {
    current: ReturnType<typeof useCalculatorData>;
  };
  formik: FormikProps<CalculationFormProps>;
  setIsRecalculationRequired: jest.Mock;
  application: Application;
};

const buildApplication = (
  paySubsidyGranted: PAY_SUBSIDY_GRANTED = PAY_SUBSIDY_GRANTED.GRANTED
): Application =>
  ({
    paySubsidyGranted,
  } as Application);

const createFormik = (
  overrides: Partial<FormikProps<CalculationFormProps>> = {}
): FormikProps<CalculationFormProps> =>
  ({
    errors: {},
    touched: {},
    values: {
      startDate: '',
      endDate: '',
      monthlyPay: '',
      workTimePercent: '',
      trainingCompensations: [],
      paySubsidies: [],
      overrideMonthlyBenefitAmount: '',
      overrideMonthlyBenefitAmountComment: '',
    },
    dirty: false,
    validateForm: jest.fn().mockResolvedValue({}),
    submitForm: jest.fn(),
    setFieldValue: jest.fn(),
    ...overrides,
  } as unknown as FormikProps<CalculationFormProps>);

const setup = ({
  formik = createFormik(),
  setIsRecalculationRequired = jest.fn(),
  application = buildApplication(),
  calculatorType = CALCULATION_TYPES.SALARY,
}: {
  formik?: FormikProps<CalculationFormProps>;
  setIsRecalculationRequired?: jest.Mock;
  application?: Application;
  calculatorType?: CALCULATION_TYPES;
} = {}): UseCalculatorDataResult => ({
  ...renderHook(() =>
    useCalculatorData(
      calculatorType,
      formik,
      setIsRecalculationRequired,
      application
    )
  ),
  formik,
  setIsRecalculationRequired,
  application,
});

type HookResult = ReturnType<typeof setup>['result'];

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
};

const runHandleSubmit = async (result: HookResult): Promise<void> => {
  result.current.handleSubmit();
  await flushPromises();
};

const runHandleClear = (result: HookResult, confirm: boolean): true => {
  const clearResult = result.current.handleClear(confirm);

  jest.runAllTimers();

  return clearResult;
};

const expectClearCalls = (
  setFieldValue: jest.Mock,
  paySubsidies: unknown[]
): void => {
  expect(setFieldValue).toHaveBeenCalledWith('endDate', '');
  expect(setFieldValue).toHaveBeenCalledWith('startDate', '');
  expect(setFieldValue).toHaveBeenCalledWith(
    'workTimePercent',
    String(PAY_SUBSIDY_PERCENT.DEFAULT)
  );
  expect(setFieldValue).toHaveBeenCalledWith('monthlyAmount', '');
  expect(setFieldValue).toHaveBeenCalledWith('paySubsidies', paySubsidies);
  expect(setFieldValue).toHaveBeenCalledWith('trainingCompensations', []);
  expect(setFieldValue).toHaveBeenCalledWith(
    'overrideMonthlyBenefitAmount',
    ''
  );
  expect(setFieldValue).toHaveBeenCalledWith(
    'overrideMonthlyBenefitAmountComment',
    ''
  );
};

describe('useCalculatorData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('returns static values and delegates getErrorMessage', () => {
    (getErrorText as jest.Mock).mockReturnValue('error text');
    const formik = createFormik({
      errors: { monthlyPay: 'required' },
      touched: { monthlyPay: true },
    });

    const { result } = setup({
      formik,
      calculatorType: CALCULATION_TYPES.EMPLOYMENT,
    });

    expect(result.current.language).toBe('fi');
    expect(result.current.theme).toBe(theme);
    expect(result.current.translationsBase).toBe(
      'common:calculators.employment'
    );
    expect(result.current.getErrorMessage('monthlyPay')).toBe('error text');
    expect(getErrorText).toHaveBeenCalledWith(
      formik.errors,
      formik.touched,
      'monthlyPay',
      expect.any(Function),
      false
    );
  });

  it('handleSubmit submits and clears recalculation flag when validation passes', async () => {
    const formik = createFormik({
      validateForm: jest.fn().mockResolvedValue({}),
      submitForm: jest.fn(),
    });
    const setIsRecalculationRequired = jest.fn();
    const { result } = setup({ formik, setIsRecalculationRequired });

    await runHandleSubmit(result);

    expect(formik.validateForm).toHaveBeenCalled();
    expect(setIsRecalculationRequired).toHaveBeenCalledWith(false);
    expect(formik.submitForm).toHaveBeenCalled();
    expect(focusAndScroll).not.toHaveBeenCalled();
    expect(getErrorText).not.toHaveBeenCalled();
  });

  it('handleSubmit focuses the first invalid field when validation fails', async () => {
    const formik = createFormik({
      validateForm: jest
        .fn()
        .mockResolvedValue({ monthlyPay: 'required', startDate: 'required' }),
      submitForm: jest.fn(),
    });
    const { result } = setup({ formik });

    await runHandleSubmit(result);

    expect(formik.submitForm).not.toHaveBeenCalled();
    expect(focusAndScroll).toHaveBeenCalledWith('monthlyPay');
  });

  it.each([
    [PAY_SUBSIDY_GRANTED.GRANTED, [PAY_SUBSIDIES_OVERRIDE]],
    [PAY_SUBSIDY_GRANTED.NOT_GRANTED, []],
  ])(
    'handleClear resets calculation fields for %s subsidies',
    (paySubsidyGranted, paySubsidies) => {
      jest.useFakeTimers();
      const formik = createFormik({ setFieldValue: jest.fn() });
      const { result } = setup({
        formik,
        application: buildApplication(paySubsidyGranted),
      });

      expect(runHandleClear(result, true)).toBe(true);

      expectClearCalls(formik.setFieldValue as jest.Mock, paySubsidies);
      expect(focusAndScroll).toHaveBeenCalledWith('monthlyPay');
    }
  );

  it('handleClear only scrolls when confirm is false', () => {
    jest.useFakeTimers();
    const formik = createFormik({ setFieldValue: jest.fn() });
    const { result } = setup({ formik });

    expect(runHandleClear(result, false)).toBe(true);

    expect(formik.setFieldValue).not.toHaveBeenCalled();
    expect(focusAndScroll).toHaveBeenCalledWith('monthlyPay');
  });

  it.each([
    [true, 1],
    [false, 0],
  ])(
    'dirty=%s updates recalculation flag call count to %i',
    (dirty, expectedCalls) => {
      const setIsRecalculationRequired = jest.fn();

      setup({
        formik: createFormik({ dirty }),
        setIsRecalculationRequired,
      });

      expect(setIsRecalculationRequired).toHaveBeenCalledTimes(expectedCalls);
      if (dirty) {
        expect(setIsRecalculationRequired).toHaveBeenCalledWith(true);
      }
    }
  );
});
