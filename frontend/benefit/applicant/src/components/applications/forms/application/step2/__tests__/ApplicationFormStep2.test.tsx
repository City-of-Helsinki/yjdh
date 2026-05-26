import 'benefit/applicant/__tests__/utils/mock-hds-date-input';

import { screen, within } from '@testing-library/react';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import ApplicationFormStep2 from 'benefit/applicant/components/applications/forms/application/step2/ApplicationFormStep2';
import { useApplicationFormStep2 } from 'benefit/applicant/components/applications/forms/application/step2/useApplicationFormStep2';
import { useAlertBeforeLeaving } from 'benefit/applicant/hooks/useAlertBeforeLeaving';
import { useDependentFieldsEffect } from 'benefit/applicant/hooks/useDependentFieldsEffect';
import {
  APPLICATION_STATUSES,
  BENEFIT_TYPES,
  EMPLOYEE_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';
import { stringFloatToFixed } from 'shared/utils/string.utils';

import i18n from '../../../../../../../test/i18n/i18n-test';

jest.mock(
  'benefit/applicant/components/applications/forms/application/step2/useApplicationFormStep2'
);
jest.mock('benefit/applicant/hooks/useAlertBeforeLeaving');
jest.mock('benefit/applicant/hooks/useDependentFieldsEffect');

function StepperActionsMock({
  handleSubmit,
  handleSave,
  handleBack,
  handleDelete,
  applicationStatus,
}: {
  handleSubmit?: jest.Mock;
  handleSave?: jest.Mock;
  handleBack?: jest.Mock;
  handleDelete?: jest.Mock;
  applicationStatus?: string;
}): React.ReactElement {
  return React.createElement(
    'div',
    {
      'data-testid': 'stepper-actions',
      'data-status': applicationStatus ?? '',
    },
    handleBack &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleBack },
        'Takaisin'
      ),
    handleSave &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleSave },
        'Tallenna'
      ),
    handleSubmit &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleSubmit },
        'Seuraava'
      ),
    handleDelete &&
      React.createElement(
        'button',
        { type: 'button', onClick: handleDelete },
        'Poista'
      )
  );
}

jest.mock(
  'benefit/applicant/components/applications/forms/application/stepperActions/StepperActions',
  () => StepperActionsMock
);

const mockUseApplicationFormStep2 = useApplicationFormStep2 as jest.Mock;
const mockUseAlertBeforeLeaving = useAlertBeforeLeaving as jest.Mock;
const mockUseDependentFieldsEffect = useDependentFieldsEffect as jest.Mock;

const t = i18n.t.bind(i18n);
const translationsBase = 'common:applications.sections.employee';

const fields = {
  employee: {
    firstName: {
      name: 'employee.firstName',
      label: 'Etunimi',
      placeholder: 'Etunimi',
    },
    lastName: {
      name: 'employee.lastName',
      label: 'Sukunimi',
      placeholder: 'Sukunimi',
    },
    socialSecurityNumber: {
      name: 'employee.socialSecurityNumber',
      label: 'Henkilotunnus',
      placeholder: '010101-123A',
    },
    isLivingInHelsinki: {
      name: 'employee.isLivingInHelsinki',
      label: 'Asuuko henkilo Helsingissa?',
      placeholder: 'Kyllä',
    },
    jobTitle: {
      name: 'employee.jobTitle',
      label: 'Tehtävänimike',
      placeholder: 'Tehtävänimike',
    },
    workingHours: {
      name: 'employee.workingHours',
      label: 'Työaika viikossa',
      placeholder: '0',
    },
    collectiveBargainingAgreement: {
      name: 'employee.collectiveBargainingAgreement',
      label: 'Sovellettava työehtosopimus',
      placeholder: 'Työehtosopimus',
    },
    monthlyPay: {
      name: 'employee.monthlyPay',
      label: 'Bruttopalkka',
      placeholder: '0',
    },
    vacationMoney: {
      name: 'employee.vacationMoney',
      label: 'Lomaraha',
      placeholder: '0',
    },
    otherExpenses: {
      name: 'employee.otherExpenses',
      label: 'Lakisaateiset sivukulut',
      placeholder: '0',
    },
  },
  associationImmediateManagerCheck: {
    name: 'associationImmediateManagerCheck',
    label: 'Vakuutan, ettei tyo liity valittomaan esimiestehtavaan',
    placeholder: 'Vakuutan',
  },
  startDate: {
    name: 'startDate',
    label: 'Työsuhteen alkupäivä',
    placeholder: 'pp.kk.vvvv',
  },
  endDate: {
    name: 'endDate',
    label: 'Työsuhteen päättymispäivä',
    placeholder: 'pp.kk.vvvv',
  },
  apprenticeshipProgram: {
    name: 'apprenticeshipProgram',
    label: 'Onko kyseessä palkkatuettu oppisopimus?',
    placeholder: '',
  },
  otherFinancialSupportForEmployment: {
    name: 'otherFinancialSupportForEmployment',
    label: 'Muu taloudellinen tuki',
  },
  roleOfEmployeeInOrganization: {
    name: 'roleOfEmployeeInOrganization',
    label: 'Työntekijän rooli yrityksessä',
  }
};

const createHookReturn = (
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => {
  const defaultFormik = {
    values: {
      employee: {
        firstName: 'Matti',
        lastName: 'Meikäläinen',
        socialSecurityNumber: '010101-123A',
        isLivingInHelsinki: true,
        jobTitle: 'Työntekijä',
        workingHours: '',
        collectiveBargainingAgreement: 'Kaupan TES',
        monthlyPay: '',
        vacationMoney: '',
        otherExpenses: '',
      },
      associationImmediateManagerCheck: false,
      startDate: '2026-06-01',
      endDate: '2026-09-01',
      apprenticeshipProgram: null,
      benefitType: BENEFIT_TYPES.EMPLOYMENT,
      paySubsidyGranted: false,
      associationHasBusinessActivities: false,
    },
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    setFieldValue: jest.fn(),
    dirty: false,
    touched: {},
    errors: {},
  };

  const overridesFormik =
    (overrides.formik as Record<string, unknown> | undefined) || {};
  const overridesValues =
    (overridesFormik.values as Record<string, unknown> | undefined) || {};
  const overridesEmployeeValues =
    (overridesValues.employee as Record<string, unknown> | undefined) || {};

  const formik = {
    ...defaultFormik,
    ...overridesFormik,
    values: {
      ...defaultFormik.values,
      ...overridesValues,
      employee: {
        ...defaultFormik.values.employee,
        ...overridesEmployeeValues,
      },
    },
  };

  return {
    t,
    clearBenefitValues: jest.fn(),
    clearCommissionValues: jest.fn(),
    clearPaySubsidyValues: jest.fn(),
    handleSubmit: jest.fn(),
    handleSave: jest.fn(),
    handleBack: jest.fn(),
    handleDelete: jest.fn(),
    getErrorMessage: jest.fn(),
    fields,
    translationsBase,
    language: 'fi',
    minEndDate: new Date('2026-06-01'),
    maxEndDate: new Date('2027-06-01'),
    organizationType: ORGANIZATION_TYPES.COMPANY,
    ...overrides,
    formik,
  };
};

const baseData = createMockApplication({
  id: 'application-123',
  status: APPLICATION_STATUSES.DRAFT,
});

const renderForm = (data: Partial<Application> = baseData): void => {
  renderComponent(<ApplicationFormStep2 data={data as Application} />);
};

describe('ApplicationFormStep2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationFormStep2.mockReturnValue(createHookReturn());
  });

  it('renders main headings and core employee fields', () => {
    renderForm();

    expect(
      screen.getByRole('heading', {
        name: 'Henkilö, jonka työllistämiseen Helsinki-lisää haetaan',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Työsuhde' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Mille ajalle haet Helsinki-lisää?' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: /Etunimi/u })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Sukunimi/u })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /Työaika viikossa/u })
    ).toBeInTheDocument();
    expect(screen.getByTestId('stepper-actions')).toBeInTheDocument();
  });

  it('shows association manager checkbox only for association organization type', () => {
    mockUseApplicationFormStep2.mockReturnValue(
      createHookReturn({ organizationType: ORGANIZATION_TYPES.ASSOCIATION })
    );

    renderForm();

    expect(
      screen.getByRole('checkbox', {
        name: /Vakuutan/u,
      })
    ).toBeInTheDocument();
  });

  it('hides association manager checkbox for company organization type', () => {
    renderForm();

    expect(
      screen.queryByRole('checkbox', {
        name: /Vakuutan/u,
      })
    ).not.toBeInTheDocument();
  });

  it('calls useDependentFieldsEffect and useAlertBeforeLeaving with current form values', () => {
    const hookReturn = createHookReturn({
      formik: {
        values: {
          paySubsidyGranted: true,
          associationHasBusinessActivities: true,
          startDate: '2026-07-01',
        },
        dirty: true,
      },
    });
    mockUseApplicationFormStep2.mockReturnValue(hookReturn);

    renderForm();

    expect(mockUseDependentFieldsEffect).toHaveBeenCalledWith(
      {
        paySubsidyGranted: true,
        associationHasBusinessActivities: true,
        startDate: '2026-07-01',
      },
      {
        isFormDirty: true,
        clearBenefitValues: hookReturn.clearBenefitValues,
        clearCommissionValues: hookReturn.clearCommissionValues,
        clearPaySubsidyValues: hookReturn.clearPaySubsidyValues,
      }
    );
    expect(mockUseAlertBeforeLeaving).toHaveBeenCalledWith(true);
  });

  it.each([
    {
      testName: 'working hours',
      inputName: /Työaika viikossa/u,
      employeeField: EMPLOYEE_KEYS.WORKING_HOURS,
      pastedValue: '12,34',
    },
    {
      testName: 'monthly pay',
      inputName: /Bruttopalkka/u,
      employeeField: EMPLOYEE_KEYS.MONTHLY_PAY,
      pastedValue: '1234,567',
    },
    {
      testName: 'vacation money',
      inputName: /Lomaraha/u,
      employeeField: EMPLOYEE_KEYS.VACATION_MONEY,
      pastedValue: '222,3499',
    },
    {
      testName: 'other expenses',
      inputName: /Lakisaateiset sivukulut/u,
      employeeField: EMPLOYEE_KEYS.OTHER_EXPENSES,
      pastedValue: '88,7777',
    },
  ])(
    'formats $testName and forwards value via setFieldValue',
    async ({ inputName, employeeField, pastedValue }) => {
      const hookReturn = createHookReturn();
      mockUseApplicationFormStep2.mockReturnValue(hookReturn);
      const user = setupUserAndRender(() => renderForm());

      const input = screen.getByRole('textbox', { name: inputName });
      await user.click(input);
      await user.paste(pastedValue);

      expect(
        (hookReturn.formik as Record<string, unknown>).setFieldValue
      ).toHaveBeenLastCalledWith(
        fields.employee[employeeField as keyof typeof fields.employee].name,
        stringFloatToFixed(pastedValue)
      );
    }
  );

  it('forwards start and end date changes via setFieldValue', async () => {
    const hookReturn = createHookReturn({
      formik: {
        values: {
          startDate: '',
          endDate: '',
        },
      },
    });
    mockUseApplicationFormStep2.mockReturnValue(hookReturn);
    const user = setupUserAndRender(() => renderForm());

    const startDateInput = screen.getByRole('textbox', {
      name: /Työsuhteen alkupäivä/u,
    });
    const endDateInput = screen.getByRole('textbox', {
      name: /Työsuhteen päättymispäivä/u,
    });

    await user.click(startDateInput);
    await user.paste('2026-07-01');
    await user.click(endDateInput);
    await user.paste('2026-12-31');

    expect(
      (hookReturn.formik as Record<string, unknown>).setFieldValue
    ).toHaveBeenCalledWith(fields.startDate.name, '2026-07-01');
    expect(
      (hookReturn.formik as Record<string, unknown>).setFieldValue
    ).toHaveBeenCalledWith(fields.endDate.name, '2026-12-31');
  });

  it('updates apprenticeshipProgram boolean when radio buttons are selected', async () => {
    const hookReturn = createHookReturn();
    mockUseApplicationFormStep2.mockReturnValue(hookReturn);
    const user = setupUserAndRender(() => renderForm());

    const apprenticeshipGroup = screen.getByRole('group', {
      name: /onko kyseessä palkkatuettu oppisopimus/i,
    });

    const noButton = within(apprenticeshipGroup).getByRole('radio', {
      name: 'Ei',
    });
    const yesButton = within(apprenticeshipGroup).getByRole('radio', {
      name: 'Kyllä',
    });

    await user.click(noButton);
    await user.click(yesButton);

    expect(
      (hookReturn.formik as Record<string, unknown>).setFieldValue
    ).toHaveBeenCalledWith(fields.apprenticeshipProgram.name, false);
    expect(
      (hookReturn.formik as Record<string, unknown>).setFieldValue
    ).toHaveBeenCalledWith(fields.apprenticeshipProgram.name, true);
  });

  it('shows apprenticeship notification when apprenticeshipProgram is true', () => {
    mockUseApplicationFormStep2.mockReturnValue(
      createHookReturn({
        formik: {
          values: {
            apprenticeshipProgram: true,
          },
        },
      })
    );

    renderForm();

    expect(
      screen.getByText(
        'Oppisopimukseen Helsinki-lisää voidaan myöntää koko oppisopimuksen ajaksi.'
      )
    ).toBeInTheDocument();
  });

  it('omits save action when touched fields contain validation errors', () => {
    mockUseApplicationFormStep2.mockReturnValue(
      createHookReturn({
        formik: {
          touched: { startDate: true },
          errors: { startDate: 'Virheellinen päivämäärä' },
        },
      })
    );

    renderForm();

    expect(
      screen.queryByRole('button', { name: 'Tallenna' })
    ).not.toBeInTheDocument();
  });

  it('passes draft status to StepperActions when application status is missing', () => {
    renderForm({ id: 'application-456' });

    expect(screen.getByTestId('stepper-actions')).toHaveAttribute(
      'data-status',
      APPLICATION_STATUSES.DRAFT
    );
  });
});
