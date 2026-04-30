import '@testing-library/jest-dom';

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { CALCULATION_SALARY_KEYS } from 'benefit/handler/constants';
import {
  Application,
  CalculationFormProps,
} from 'benefit/handler/types/application';
import { FormikProps } from 'formik';
import React from 'react';

import SalaryBenefitCalculatorView from '../SalaryBenefitCalculatorView';

const mockUseCalculatorData = jest.fn();
const mockUseSalaryBenefitCalculatorData = jest.fn();

jest.mock('benefit/handler/hooks/useCalculatorData', () => ({
  useCalculatorData: (...args: unknown[]) => mockUseCalculatorData(...args),
}));

jest.mock('../useSalaryBenefitCalculatorData', () => ({
  useSalaryBenefitCalculatorData: (...args: unknown[]) =>
    mockUseSalaryBenefitCalculatorData(...args),
}));

const mockHandleSubmit = jest.fn();
const mockHandleClear = jest.fn(() => true as const);
const mockSetNewTrainingCompensation = jest.fn();
const mockChangeCalculatorMode = jest.fn(() => true as const);
const mockSetFieldValue = jest.fn();

const buildField = (name: string): { name: string; label: string; placeholder: string } => ({
  name,
  label: name,
  placeholder: name,
});

const fields = {
  [CALCULATION_SALARY_KEYS.START_DATE]: buildField(
    CALCULATION_SALARY_KEYS.START_DATE
  ),
  [CALCULATION_SALARY_KEYS.END_DATE]: buildField(
    CALCULATION_SALARY_KEYS.END_DATE
  ),
  [CALCULATION_SALARY_KEYS.MONTHLY_PAY]: buildField(
    CALCULATION_SALARY_KEYS.MONTHLY_PAY
  ),
  [CALCULATION_SALARY_KEYS.OTHER_EXPENSES]: buildField(
    CALCULATION_SALARY_KEYS.OTHER_EXPENSES
  ),
  [CALCULATION_SALARY_KEYS.VACATION_MONEY]: buildField(
    CALCULATION_SALARY_KEYS.VACATION_MONEY
  ),
  [CALCULATION_SALARY_KEYS.STATE_AID_MAX_PERCENTAGE]: buildField(
    CALCULATION_SALARY_KEYS.STATE_AID_MAX_PERCENTAGE
  ),
  [CALCULATION_SALARY_KEYS.MONTHLY_AMOUNT]: buildField(
    CALCULATION_SALARY_KEYS.MONTHLY_AMOUNT
  ),
  [CALCULATION_SALARY_KEYS.TRAINING_COMPENSATION_START_DATE]: buildField(
    CALCULATION_SALARY_KEYS.TRAINING_COMPENSATION_START_DATE
  ),
  [CALCULATION_SALARY_KEYS.TRAINING_COMPENSATION_END_DATE]: buildField(
    CALCULATION_SALARY_KEYS.TRAINING_COMPENSATION_END_DATE
  ),
  [CALCULATION_SALARY_KEYS.PAY_SUBSIDIES]: buildField(
    CALCULATION_SALARY_KEYS.PAY_SUBSIDIES
  ),
  [CALCULATION_SALARY_KEYS.PAY_SUBSIDY_PERCENT]: buildField(
    CALCULATION_SALARY_KEYS.PAY_SUBSIDY_PERCENT
  ),
  [CALCULATION_SALARY_KEYS.WORK_TIME_PERCENT]: buildField(
    CALCULATION_SALARY_KEYS.WORK_TIME_PERCENT
  ),
};

const formik = {
  values: {
    startDate: '1.1.2024',
    endDate: '30.6.2024',
    monthlyPay: '2500',
    otherExpenses: '100',
    vacationMoney: '100',
    stateAidMaxPercentage: 50,
    paySubsidies: [],
    trainingCompensations: [],
    overrideMonthlyBenefitAmount: '',
    overrideMonthlyBenefitAmountComment: '',
  },
  setFieldValue: mockSetFieldValue,
} as unknown as FormikProps<CalculationFormProps>;

const application = {
  apprenticeshipProgram: false,
  startDate: '2024-01-01',
  endDate: '2024-06-30',
  durationInMonthsRounded: '6',
  calculation: {
    rows: [
      {
        id: 'row-1',
        descriptionFi: 'Rivi 1',
        amount: 100,
      },
      {
        id: 'row-2',
        descriptionFi: 'Kuvaus yhteensa',
        amount: 0,
      },
      {
        id: 'row-3',
        descriptionFi: 'Yhteensa',
        amount: 100,
      },
    ],
  },
} as unknown as Application;

const setIsRecalculationRequired = jest.fn();
const setCalculationErrors = jest.fn();

const createSalaryBenefitCalculatorDataMock = (
  overrides: Record<string, unknown> = {}
): unknown => ({
  formik,
  fields: fields as never,
  grantedPeriod: 6,
  stateAidMaxPercentageOptions: [
    { label: '50%', value: 50 },
    { label: '100%', value: 100 },
  ],
  getStateAidMaxPercentageSelectValue: () => ({ label: '50%', value: 50 }),
  paySubsidyPercentageOptions: [
    { label: '50%', value: 50 },
    { label: '100%', value: 100 },
  ],
  getPaySubsidyPercentageSelectValue: () => ({ label: '50%', value: 50 }),
  isManualCalculator: false,
  changeCalculatorMode: mockChangeCalculatorMode as unknown as (
    mode: 'auto' | 'manual'
  ) => true,
  newTrainingCompensation: {
    id: '',
    monthlyAmount: '',
    startDate: '',
    endDate: '',
  },
  setNewTrainingCompensation: mockSetNewTrainingCompensation,
  addNewTrainingCompensation: jest.fn(),
  removeTrainingCompensation: jest.fn(),
  isDisabledAddTrainingCompensationButton: true,
  dateInputLimits: {
    min: new Date('2024-01-01'),
    max: new Date('2024-12-31'),
  },
  ...overrides,
});

const renderSubject = (props: {
  isRecalculationRequired?: boolean;
  calculationsErrors?: Record<string, unknown> | null;
  applicationOverride?: Record<string, unknown>;
} = {}): void => {
  const mergedApplication = {
    ...(application as unknown as Record<string, unknown>),
    ...props.applicationOverride,
  } as unknown as Application;

  renderComponent(
    <SalaryBenefitCalculatorView
      application={mergedApplication}
      isRecalculationRequired={props.isRecalculationRequired ?? false}
      setIsRecalculationRequired={setIsRecalculationRequired}
      setCalculationErrors={setCalculationErrors}
      calculationsErrors={props.calculationsErrors}
    />
  );
};

const typeDateInput = async (
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLElement,
  value: string
): Promise<void> => {
  await user.click(input);
  await user.clear(input);
  await user.type(input, value);
  await user.tab();
};

describe('SalaryBenefitCalculatorView', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSalaryBenefitCalculatorData.mockReturnValue(
      createSalaryBenefitCalculatorDataMock() as never
    );

    mockUseCalculatorData.mockReturnValue({
      t: ((key: string) => key) as never,
      translationsBase: 'common:calculators.salary',
      theme: {
        spacing: { xs: '4px', s: '8px' },
        colors: { brick: '#b00000' },
        components: { modal: { coat: {} } },
      } as never,
      language: 'fi',
      handleSubmit: mockHandleSubmit,
      handleClear: mockHandleClear as unknown as (confirm: boolean) => true,
      getErrorMessage: () => {},
    } as never);
  });

  it('calls handleSubmit when calculation button is clicked', async () => {
    renderSubject();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('run-calculation'));

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it('updates monthlyPay via formik.setFieldValue when monthly pay input changes', async () => {
    renderSubject();
    const user = userEvent.setup();

    const monthlyPayInput = screen.getByRole('textbox', {
      name: CALCULATION_SALARY_KEYS.MONTHLY_PAY,
    });

    await user.clear(monthlyPayInput);
    await user.type(monthlyPayInput, '3000');

    expect(mockSetFieldValue).toHaveBeenCalledWith(
      CALCULATION_SALARY_KEYS.MONTHLY_PAY,
      ''
    );
    expect(mockSetFieldValue).toHaveBeenLastCalledWith(
      CALCULATION_SALARY_KEYS.MONTHLY_PAY,
      expect.any(String)
    );
  });

  it.each([
    CALCULATION_SALARY_KEYS.OTHER_EXPENSES,
    CALCULATION_SALARY_KEYS.VACATION_MONEY,
  ])(
    'updates %s via formik.setFieldValue when textbox value changes',
    async (fieldName) => {
      renderSubject();
      const user = userEvent.setup();

      const input = screen.getByRole('textbox', {
        name: fieldName,
      });

      await user.clear(input);
      await user.type(input, '200');

      expect(mockSetFieldValue).toHaveBeenCalledWith(fieldName, '');
      expect(mockSetFieldValue).toHaveBeenLastCalledWith(
        fieldName,
        expect.any(String)
      );
    }
  );

  it.each([
    CALCULATION_SALARY_KEYS.START_DATE,
    CALCULATION_SALARY_KEYS.END_DATE,
  ])('updates %s via formik.setFieldValue when date input changes', async (fieldName) => {
    renderSubject();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(fieldName);
    await typeDateInput(user, input, '2.1.2024');

    expect(mockSetFieldValue).toHaveBeenCalledWith(fieldName, '2.1.2024');
  });

  it('updates stateAidMaxPercentage via formik.setFieldValue when select value changes', async () => {
    renderSubject();
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '100%' }));

    expect(mockSetFieldValue).toHaveBeenCalledWith(
      CALCULATION_SALARY_KEYS.STATE_AID_MAX_PERCENTAGE,
      100
    );
  });

  describe('newTrainingCompensation updater', () => {
    const capturedResults: unknown[] = [];
    const prevState = { id: '', monthlyAmount: '', startDate: '', endDate: '' };

    beforeEach(() => {
      capturedResults.length = 0;
      mockSetNewTrainingCompensation.mockImplementation(
        (fn: (prev: typeof prevState) => unknown) => {
          capturedResults.push(fn(prevState));
        }
      );
    });

    afterEach(() => {
      mockSetNewTrainingCompensation.mockReset();
    });

    it('updates newTrainingCompensation via updater function when training compensation inputs change', async () => {
      renderSubject({ applicationOverride: { apprenticeshipProgram: true } });
      const user = userEvent.setup();

      // monthlyAmount — TextInput; fireEvent sets the full value atomically
      // (userEvent.type can't be used here: the controlled input doesn't
      // re-render between keystrokes because the mock doesn't update state,
      // so e.target.value would only ever reflect the last typed character).
      const monthlyAmountInput = screen.getByRole('textbox', {
        name: CALCULATION_SALARY_KEYS.MONTHLY_AMOUNT,
      });
      fireEvent.change(monthlyAmountInput, { target: { value: '500' } });
      expect(capturedResults.at(-1)).toMatchObject({ monthlyAmount: '500' });

      // trainingCompensationStartDate — DateInput, onChange fires on blur
      const startDateInput = screen.getByRole('textbox', {
        name: 'Alkamispäivä',
      });
      await typeDateInput(user, startDateInput, '2.1.2024');
      expect(capturedResults.at(-1)).toMatchObject({ startDate: '2.1.2024' });

      // trainingCompensationEndDate — DateInput, onChange fires on blur
      const endDateInput = screen.getByRole('textbox', {
        name: 'Päättymispäivä',
      });
      await typeDateInput(user, endDateInput, '2.7.2024');
      expect(mockSetNewTrainingCompensation).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  it('changes calculator mode and requests recalculation when tabs are clicked', async () => {
    renderSubject();
    const user = userEvent.setup();

    await user.click(
      screen.getByText(/laske käsin/i)
    );

    expect(mockChangeCalculatorMode).toHaveBeenCalledWith('manual');
    expect(setIsRecalculationRequired).toHaveBeenCalledWith(true);

    await user.click(screen.getByText(/laskuri|calculator/i));

    expect(mockChangeCalculatorMode).toHaveBeenCalledWith('auto');
  });

  it('opens reset modal and confirms clear action', async () => {
    renderSubject();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: /tyhjenna|tyhjennä/i,
      })
    );

    const confirmButton = await screen.findByTestId('modalSubmit');

    await user.click(confirmButton);

    expect(mockSetNewTrainingCompensation).toHaveBeenCalledWith({
      id: '',
      monthlyAmount: '',
      startDate: '',
      endDate: '',
    });
    expect(mockHandleClear).toHaveBeenCalledWith(true);
  });

  it('shows recalculation notification when recalculation is required and rows exist', () => {
    renderSubject({
      isRecalculationRequired: true,
      calculationsErrors: null,
    });

    expect(
      screen.queryByText(/laskelman arvot muuttuneet/i)
    ).toBeInTheDocument();
  });

  it('shows training compensation invalid warning when apprenticeship is on and add button is enabled', () => {
    mockUseSalaryBenefitCalculatorData.mockReturnValue(
      createSalaryBenefitCalculatorDataMock({
        isDisabledAddTrainingCompensationButton: false,
      }) as never
    );

    renderSubject({
      applicationOverride: {
        apprenticeshipProgram: true,
      },
    });

    expect(
      screen.queryByText(
        /koulutuskorvausrivin syöttö on vielä kesken/i
      )
    ).toBeInTheDocument();
  });

  it('calls removeTrainingCompensation with item id when clicking remove row action', async () => {
    const user = userEvent.setup();
    const removeTrainingCompensation = jest.fn();

    mockUseSalaryBenefitCalculatorData.mockReturnValue(
      createSalaryBenefitCalculatorDataMock({
        formik: {
          ...formik,
          values: {
            ...formik.values,
            trainingCompensations: [
              {
                id: 'tc-1',
                monthlyAmount: '100',
                startDate: '1.7.2024',
                endDate: '31.7.2024',
              },
            ],
          },
        },
        removeTrainingCompensation,
      }) as never
    );

    renderSubject({
      applicationOverride: {
        apprenticeshipProgram: true,
      },
    });

    await user.click(
      screen.getByRole('button', { name: /poista|remove/i })
    );

    expect(removeTrainingCompensation).toHaveBeenCalledWith('tc-1');
  });

  it('hides calculator results when calculation errors exist', () => {
    renderSubject({
      calculationsErrors: { detail: 'error' },
    });

    expect(
      screen.queryByTestId('calculation-results-total')
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/laskurissa on virheitä/i)).toBeInTheDocument();
  });

  describe('paySubsidies updater', () => {
    const paySubsidyItem = {
      id: 'ps-1',
      paySubsidyPercent: 50,
      workTimePercent: 65,
      startDate: '1.1.2024',
      endDate: '30.6.2024',
      disabilityOrIllness: false,
      durationInMonthsRounded: '6',
    };

    const renderWithPaySubsidies = (overrides: Record<string, unknown> = {}): void => {
      mockUseSalaryBenefitCalculatorData.mockReturnValue(
        createSalaryBenefitCalculatorDataMock({
          formik: {
            ...formik,
            values: {
              ...formik.values,
              paySubsidies: [{ ...paySubsidyItem, ...overrides }],
            },
          },
        }) as never
      );
      renderSubject();
    };

    it('updates paySubsidyPercent via formik when select value changes', async () => {
      renderWithPaySubsidies();
      const user = userEvent.setup();

      // The paySubsidyPercent Select combobox is labelled by texts.label (Finnish translation)
      const combobox = screen.getByRole('combobox', {
        name: /tukiprosentti/i,
      });
      await user.click(combobox);
      await user.click(screen.getByRole('option', { name: '100%' }));

      expect(mockSetFieldValue).toHaveBeenCalledWith(
        CALCULATION_SALARY_KEYS.PAY_SUBSIDIES,
        [expect.objectContaining({ paySubsidyPercent: 100 })]
      );
    });

    it('updates workTimePercent via formik when textbox changes (100% subsidy only)', () => {
      renderWithPaySubsidies({ paySubsidyPercent: 100 });

      // workTimePercent is a controlled input; fireEvent sets the full value atomically
      const workTimeInput = screen.getByRole('textbox', {
        name: CALCULATION_SALARY_KEYS.WORK_TIME_PERCENT,
      });
      fireEvent.change(workTimeInput, { target: { value: '75' } });

      expect(mockSetFieldValue).toHaveBeenCalledWith(
        CALCULATION_SALARY_KEYS.PAY_SUBSIDIES,
        [expect.objectContaining({ workTimePercent: 75 })]
      );
    });

    it('updates paySubsidy startDate via formik when date input changes', async () => {
      renderWithPaySubsidies();
      const user = userEvent.setup();

      // PaySubsidies section renders before the main calculator date inputs in the DOM
      const startDateInputs = screen.getAllByPlaceholderText(
        CALCULATION_SALARY_KEYS.START_DATE
      );
      await typeDateInput(user, startDateInputs[0], '15.2.2024');

      expect(mockSetFieldValue).toHaveBeenCalledWith(
        CALCULATION_SALARY_KEYS.PAY_SUBSIDIES,
        [expect.objectContaining({ startDate: '15.2.2024' })]
      );
    });

    it('updates paySubsidy endDate via formik when date input changes', async () => {
      renderWithPaySubsidies();
      const user = userEvent.setup();

      // PaySubsidies section renders before the main calculator date inputs in the DOM
      const endDateInputs = screen.getAllByPlaceholderText(
        CALCULATION_SALARY_KEYS.END_DATE
      );
      await typeDateInput(user, endDateInputs[0], '15.5.2024');

      expect(mockSetFieldValue).toHaveBeenCalledWith(
        CALCULATION_SALARY_KEYS.PAY_SUBSIDIES,
        [expect.objectContaining({ endDate: expect.any(String) })]
      );
    });
  });
});
