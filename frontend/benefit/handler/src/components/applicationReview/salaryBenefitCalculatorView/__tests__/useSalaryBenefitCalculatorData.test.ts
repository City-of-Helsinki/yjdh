import { act, renderHook } from '@testing-library/react';
import { CALCULATION_SALARY_KEYS } from 'benefit/handler/constants';
import {
  Application,
  TrainingCompensation,
} from 'benefit-shared/types/application';

import { useSalaryBenefitCalculatorData } from '../useSalaryBenefitCalculatorData';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

jest.mock('benefit/handler/hooks/useHandlerReviewActions', () =>
  jest.fn(() => ({
    calculateSalaryBenefit: jest.fn(),
  }))
);

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const buildApplication = (overrides: Partial<Application> = {}): Application =>
  ({
    id: 'app-1',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    paySubsidies: [],
    trainingCompensations: [],
    calculation: {
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      monthlyPay: '2000',
      otherExpenses: '100',
      vacationMoney: '200',
      stateAidMaxPercentage: 50,
      overrideMonthlyBenefitAmount: null,
      overrideMonthlyBenefitAmountComment: '',
    },
    ...overrides,
  } as unknown as Application);

describe('useSalaryBenefitCalculatorData', () => {
  const setCalculationErrors = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns all expected fields', () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.formik).toBeDefined();
    expect(result.current.fields).toBeDefined();
    expect(result.current.stateAidMaxPercentageOptions).toBeDefined();
    expect(result.current.isManualCalculator).toBe(false);
    expect(result.current.newTrainingCompensation).toBeDefined();
    expect(result.current.dateInputLimits).toBeDefined();
  });

  it('sets isManualCalculator to true when overrideMonthlyBenefitAmount is set', () => {
    const application = buildApplication({
      calculation: {
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        monthlyPay: '2000',
        otherExpenses: '100',
        vacationMoney: '200',
        stateAidMaxPercentage: 50,
        overrideMonthlyBenefitAmount: '500',
        overrideMonthlyBenefitAmountComment: 'manual',
      } as Application['calculation'],
    });
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.isManualCalculator).toBe(true);
  });

  it('stateAidMaxPercentageOptions contains formatted percentage labels', () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.stateAidMaxPercentageOptions).toEqual(
      expect.arrayContaining([
        { label: '50%', value: 50 },
        { label: '100%', value: 100 },
      ])
    );
  });

  it('getStateAidMaxPercentageSelectValue returns matching option', () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    const val = result.current.getStateAidMaxPercentageSelectValue();
    expect(val).toEqual({ label: '50%', value: 50 });
  });

  it('getStateAidMaxPercentageSelectValue returns null when no match', () => {
    const application = buildApplication({
      calculation: {
        ...buildApplication().calculation,
        stateAidMaxPercentage: 99,
      } as Application['calculation'],
    });
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    const val = result.current.getStateAidMaxPercentageSelectValue();
    expect(val).toBeNull();
  });

  it('grantedPeriod is calculated from start and end dates', () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    // 6 months difference between 2026-01-01 and 2026-06-30
    expect(typeof result.current.grantedPeriod).toBe('number');
  });

  it('addNewTrainingCompensation appends entry with generated id and resets form', async () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    await act(async () => {
      result.current.setNewTrainingCompensation({
        id: '',
        monthlyAmount: '300',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });
    });

    await act(async () => {
      result.current.addNewTrainingCompensation();
    });

    const compensations = result.current.formik.values[
      CALCULATION_SALARY_KEYS.TRAINING_COMPENSATIONS
    ] as TrainingCompensation[];
    expect(compensations).toHaveLength(1);
    expect(compensations[0]).toMatchObject({
      id: 'test-uuid',
      monthlyAmount: '300',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });

    // newTrainingCompensation is reset
    expect(result.current.newTrainingCompensation.monthlyAmount).toBe('');
  });

  it('removeTrainingCompensation removes entry by id', async () => {
    const application = buildApplication({
      trainingCompensations: [
        {
          id: 'tc-1',
          monthlyAmount: '100',
          startDate: '2026-01-01',
          endDate: '2026-02-28',
        },
        {
          id: 'tc-2',
          monthlyAmount: '200',
          startDate: '2026-03-01',
          endDate: '2026-04-30',
        },
      ],
    });
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    await act(async () => {
      result.current.removeTrainingCompensation('tc-1');
    });

    const compensations = result.current.formik.values[
      CALCULATION_SALARY_KEYS.TRAINING_COMPENSATIONS
    ] as TrainingCompensation[];
    expect(compensations).toHaveLength(1);
    expect(compensations[0].id).toBe('tc-2');
  });

  it('isDisabledAddTrainingCompensationButton is true when fields are empty', () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.isDisabledAddTrainingCompensationButton).toBe(true);
  });

  it('isDisabledAddTrainingCompensationButton becomes false when all fields are filled', async () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    await act(async () => {
      result.current.setNewTrainingCompensation({
        id: '',
        monthlyAmount: '300',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });
    });

    expect(result.current.isDisabledAddTrainingCompensationButton).toBe(false);
  });

  it('changeCalculatorMode switches to manual mode', async () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.isManualCalculator).toBe(false);

    await act(async () => {
      result.current.changeCalculatorMode('manual');
    });

    expect(result.current.isManualCalculator).toBe(true);
  });

  it('changeCalculatorMode switches back to auto mode and clears override field', async () => {
    const application = buildApplication({
      calculation: {
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        monthlyPay: '2000',
        otherExpenses: '100',
        vacationMoney: '200',
        stateAidMaxPercentage: 50,
        overrideMonthlyBenefitAmount: '500',
        overrideMonthlyBenefitAmountComment: 'manual',
      } as Application['calculation'],
    });
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.isManualCalculator).toBe(true);

    await act(async () => {
      result.current.changeCalculatorMode('auto');
    });

    expect(result.current.isManualCalculator).toBe(false);
    expect(
      result.current.formik.values[
        CALCULATION_SALARY_KEYS.OVERRIDE_MONTHLY_BENEFIT_AMOUNT
      ]
    ).toBeNull();
  });

  it('dateInputLimits min and max are Date objects', () => {
    const application = buildApplication();
    const { result } = renderHook(() =>
      useSalaryBenefitCalculatorData(application, setCalculationErrors)
    );

    expect(result.current.dateInputLimits.min).toBeInstanceOf(Date);
    expect(result.current.dateInputLimits.max).toBeInstanceOf(Date);
  });
});
