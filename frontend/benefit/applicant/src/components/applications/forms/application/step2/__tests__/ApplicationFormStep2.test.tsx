import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import {
  APPLICATION_FIELDS_STEP2_KEYS,
  APPLICATION_STATUSES,
  BENEFIT_TYPES,
  EMPLOYEE_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import React from 'react';

import ApplicationFormStep2 from '../ApplicationFormStep2';
import { useApplicationFormStep2 } from '../useApplicationFormStep2';

jest.mock('../useApplicationFormStep2', () => ({
  useApplicationFormStep2: jest.fn(),
}));

jest.mock('benefit/applicant/hooks/useAlertBeforeLeaving', () => ({
  useAlertBeforeLeaving: jest.fn(),
}));

jest.mock('benefit/applicant/hooks/useDependentFieldsEffect', () => ({
  useDependentFieldsEffect: jest.fn(),
}));

jest.mock(
  '../../stepperActions/StepperActions',
  () =>
    function StepperActions(): JSX.Element {
      return <div data-testid="stepper-actions" />;
    }
);

const mockUseApplicationFormStep2 =
  useApplicationFormStep2 as jest.MockedFunction<
    typeof useApplicationFormStep2
  >;

const field = (
  name: string
): {
  name: string;
  label: string;
  placeholder: string;
} => ({
  name,
  label: `${name} label`,
  placeholder: `${name} placeholder`,
});

const getFields = (): ReturnType<typeof useApplicationFormStep2>['fields'] =>
  ({
    employee: {
      [EMPLOYEE_KEYS.FIRST_NAME]: field(`employee.${EMPLOYEE_KEYS.FIRST_NAME}`),
      [EMPLOYEE_KEYS.LAST_NAME]: field(`employee.${EMPLOYEE_KEYS.LAST_NAME}`),
      [EMPLOYEE_KEYS.SOCIAL_SECURITY_NUMBER]: field(
        `employee.${EMPLOYEE_KEYS.SOCIAL_SECURITY_NUMBER}`
      ),
      [EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI]: field(
        `employee.${EMPLOYEE_KEYS.IS_LIVING_IN_HELSINKI}`
      ),
      [EMPLOYEE_KEYS.JOB_TITLE]: field(`employee.${EMPLOYEE_KEYS.JOB_TITLE}`),
      [EMPLOYEE_KEYS.WORKING_HOURS]: field(
        `employee.${EMPLOYEE_KEYS.WORKING_HOURS}`
      ),
      [EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT]: field(
        `employee.${EMPLOYEE_KEYS.COLLECTIVE_BARGAINING_AGREEMENT}`
      ),
      [EMPLOYEE_KEYS.MONTHLY_PAY]: field(
        `employee.${EMPLOYEE_KEYS.MONTHLY_PAY}`
      ),
      [EMPLOYEE_KEYS.VACATION_MONEY]: field(
        `employee.${EMPLOYEE_KEYS.VACATION_MONEY}`
      ),
      [EMPLOYEE_KEYS.OTHER_EXPENSES]: field(
        `employee.${EMPLOYEE_KEYS.OTHER_EXPENSES}`
      ),
      [EMPLOYEE_KEYS.EMPLOYEE_COMMISSION_AMOUNT]: field(
        `employee.${EMPLOYEE_KEYS.EMPLOYEE_COMMISSION_AMOUNT}`
      ),
      [EMPLOYEE_KEYS.COMMISSION_DESCRIPTION]: field(
        `employee.${EMPLOYEE_KEYS.COMMISSION_DESCRIPTION}`
      ),
    },
    [APPLICATION_FIELDS_STEP2_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK]: field(
      APPLICATION_FIELDS_STEP2_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT]:
      field(
        APPLICATION_FIELDS_STEP2_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT
      ),
    [APPLICATION_FIELDS_STEP2_KEYS.ROLE_OF_EMPLOYEE_IN_ORGANIZATION]: field(
      APPLICATION_FIELDS_STEP2_KEYS.ROLE_OF_EMPLOYEE_IN_ORGANIZATION
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED]: field(
      APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_GRANTED
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_PERCENT]: field(
      APPLICATION_FIELDS_STEP2_KEYS.PAY_SUBSIDY_PERCENT
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.ADDITIONAL_PAY_SUBSIDY_PERCENT]: field(
      APPLICATION_FIELDS_STEP2_KEYS.ADDITIONAL_PAY_SUBSIDY_PERCENT
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM]: field(
      APPLICATION_FIELDS_STEP2_KEYS.APPRENTICESHIP_PROGRAM
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE]: field(
      APPLICATION_FIELDS_STEP2_KEYS.BENEFIT_TYPE
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.START_DATE]: field(
      APPLICATION_FIELDS_STEP2_KEYS.START_DATE
    ),
    [APPLICATION_FIELDS_STEP2_KEYS.END_DATE]: field(
      APPLICATION_FIELDS_STEP2_KEYS.END_DATE
    ),
  } as ReturnType<typeof useApplicationFormStep2>['fields']);

const setFieldValue = jest.fn();
const handleChange = jest.fn();
const handleBlur = jest.fn();

const setupUseApplicationFormStep2Mock = (
  values: Record<string, unknown> = {}
): void => {
  mockUseApplicationFormStep2.mockReturnValue({
    t: (key: string) => key,
    clearBenefitValues: jest.fn(),
    clearCommissionValues: jest.fn(),
    clearPaySubsidyValues: jest.fn(),
    handleSubmit: jest.fn(),
    handleSave: jest.fn(),
    handleBack: jest.fn(),
    handleDelete: jest.fn(),
    getErrorMessage: jest.fn(),
    fields: getFields(),
    translationsBase: 'common:applications.sections.employee',
    language: 'fi',
    minEndDate: new Date('2024-01-01'),
    maxEndDate: new Date('2024-12-31'),
    organizationType: ORGANIZATION_TYPES.COMPANY,
    formik: {
      dirty: false,
      errors: {},
      touched: {},
      values: {
        employee: {
          firstName: '',
          lastName: '',
          socialSecurityNumber: '',
          isLivingInHelsinki: false,
          jobTitle: '',
          workingHours: '',
          collectiveBargainingAgreement: '',
          monthlyPay: '',
          vacationMoney: '',
          otherExpenses: '',
        },
        benefitType: BENEFIT_TYPES.SALARY,
        otherFinancialSupportForEmployment: null,
        roleOfEmployeeInOrganization: '',
        startDate: '',
        endDate: '',
        apprenticeshipProgram: null,
        ...values,
      },
      handleBlur,
      handleChange,
      setFieldValue,
    } as unknown as ReturnType<typeof useApplicationFormStep2>['formik'],
  });
};

const renderApplicationFormStep2 = (): void => {
  renderComponent(
    <ApplicationFormStep2
      data={{
        status: APPLICATION_STATUSES.DRAFT,
      }}
    />
  );
};

describe('ApplicationFormStep2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupUseApplicationFormStep2Mock();
  });

  it('renders roleOfEmployeeInOrganization textarea and wires it to Formik change handling', () => {
    renderApplicationFormStep2();

    const textarea = screen.getByRole('textbox', {
      name: /roleofemployeeinorganization label/i,
    });

    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, {
      target: {
        name: APPLICATION_FIELDS_STEP2_KEYS.ROLE_OF_EMPLOYEE_IN_ORGANIZATION,
        value: 'Työntekijä vastaa kuljetustehtävistä.',
      },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders existing roleOfEmployeeInOrganization value', () => {
    setupUseApplicationFormStep2Mock({
      roleOfEmployeeInOrganization: 'Työntekijä vastaa asiakaspalvelusta.',
    });

    renderApplicationFormStep2();

    expect(
      screen.getByRole('textbox', {
        name: /roleofemployeeinorganization label/i,
      })
    ).toHaveValue('Työntekijä vastaa asiakaspalvelusta.');
  });

  it('sets otherFinancialSupportForEmployment to false when no is selected', () => {
    renderApplicationFormStep2();

    fireEvent.click(screen.getByLabelText('Ei'));

    expect(setFieldValue).toHaveBeenCalledWith(
      APPLICATION_FIELDS_STEP2_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT,
      false
    );
  });

  it('sets otherFinancialSupportForEmployment to true when yes is selected', () => {
    renderApplicationFormStep2();

    fireEvent.click(screen.getByLabelText('Kyllä'));

    expect(setFieldValue).toHaveBeenCalledWith(
      APPLICATION_FIELDS_STEP2_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT,
      true
    );
  });

  it('checks the selected otherFinancialSupportForEmployment radio value', () => {
    setupUseApplicationFormStep2Mock({
      otherFinancialSupportForEmployment: true,
    });

    renderApplicationFormStep2();

    expect(screen.getByLabelText('Kyllä')).toBeChecked();
    expect(screen.getByLabelText('Ei')).not.toBeChecked();
  });
});
