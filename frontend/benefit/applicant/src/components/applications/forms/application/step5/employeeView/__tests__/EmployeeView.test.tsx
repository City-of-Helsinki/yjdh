import { RenderResult, screen, within } from '@testing-library/react';
import { createMockApplication } from 'benefit/applicant/__tests__/utils/mock-data';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { BENEFIT_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { axe } from 'jest-axe';
import React from 'react';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import EmployeeView, { EmployeeViewProps } from '../EmployeeView';

const expectFieldText = (testId: string, text: string | RegExp): void => {
  expect(screen.getByTestId(testId)).toHaveTextContent(text);
};

describe('EmployeeView', () => {
  const defaultEmployee = {
    firstName: 'Matti',
    lastName: 'Meikäläinen',
    socialSecurityNumber: '010101-123A',
    isLivingInHelsinki: true,
    jobTitle: 'Asiakaspalvelija',
    collectiveBargainingAgreement: 'Kaupan TES',
    workingHours: '37.5',
    monthlyPay: '2500',
    vacationMoney: '200',
    otherExpenses: '300',
  };

  const buildData = (overrides: Partial<Application> = {}): Application =>
    createMockApplication({
      benefitType: BENEFIT_TYPES.EMPLOYMENT,
      startDate: '2026-05-01',
      endDate: '2026-10-31',
      apprenticeshipProgram: false,
      associationImmediateManagerCheck: false,
      ...overrides,
      employee: {
        ...defaultEmployee,
        ...overrides.employee,
      },
    });

  const initialProps: EmployeeViewProps = {
    data: buildData(),
    handleStepChange: jest.fn(),
  };

  const getComponent = (props: Partial<EmployeeViewProps> = {}): RenderResult =>
    renderComponent(<EmployeeView {...initialProps} {...props} />).renderResult;

  const renderView = (
    dataOverrides: Partial<Application> = {},
    props: Partial<EmployeeViewProps> = {}
  ): RenderResult => getComponent({ data: buildData(dataOverrides), ...props });

  it('renders with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('shows edit action and calls handleStepChange(2) on click', async () => {
    const handleStepChange = jest.fn();
    const user = setupUserAndRender(() =>
      getComponent({ handleStepChange, isReadOnly: false })
    );

    await user.click(screen.getByRole('button', { name: 'Muokkaa' }));

    expect(handleStepChange).toHaveBeenCalledWith(2);
  });

  it('hides edit action in read-only mode', () => {
    getComponent({ isReadOnly: true });

    expect(
      screen.queryByRole('button', { name: 'Muokkaa' })
    ).not.toBeInTheDocument();
  });

  it('renders employee identity fields', () => {
    renderView({
      employee: {
        firstName: 'Liisa',
        lastName: 'Lahtinen',
        socialSecurityNumber: '020202-456B',
      } as Application['employee'],
    });

    expectFieldText('application-field-firstName', 'Liisa');
    expectFieldText('application-field-lastName', 'Lahtinen');
    expectFieldText('application-field-socialSecurityNumber', '020202-456B');
  });

  it.each([
    { isLivingInHelsinki: true, expectedText: 'Kyllä' },
    { isLivingInHelsinki: false, expectedText: 'Ei' },
  ])(
    'renders living-in-helsinki status as $expectedText',
    ({ isLivingInHelsinki, expectedText }) => {
      renderView({
        employee: {
          isLivingInHelsinki,
        } as Application['employee'],
      });

      expect(
        within(
          screen.getByTestId('application-field-isLivingInHelsinki')
        ).getByText(expectedText)
      ).toBeInTheDocument();
    }
  );

  it.each([
    { associationImmediateManagerCheck: true, shouldExist: true },
    { associationImmediateManagerCheck: false, shouldExist: false },
  ])(
    'renders association immediate manager row when value is $associationImmediateManagerCheck',
    ({ associationImmediateManagerCheck, shouldExist }) => {
      renderView({ associationImmediateManagerCheck });

      const row = screen.queryByTestId(
        'application-field-associationImmediateManagerCheck'
      );

      if (shouldExist) {
        expect(row).toHaveTextContent('Kyllä');
      } else {
        expect(row).not.toBeInTheDocument();
      }
    }
  );

  it.each([BENEFIT_TYPES.EMPLOYMENT, BENEFIT_TYPES.SALARY])(
    'shows employment detail section for benefitType %s',
    (benefitType) => {
      renderView({ benefitType });

      expect(
        screen.getByRole('heading', { name: 'Työsuhde' })
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('application-field-jobTitle')
      ).toBeInTheDocument();
    }
  );

  it('hides employment detail section for commission benefit type', () => {
    renderView({ benefitType: BENEFIT_TYPES.COMMISSION });

    expect(
      screen.queryByTestId('application-field-jobTitle')
    ).not.toBeInTheDocument();
  });

  it('renders formatted salary details and working hours helper text', () => {
    renderView({
      employee: {
        workingHours: '37.5',
        monthlyPay: '2500',
        vacationMoney: '200',
        otherExpenses: '300',
      } as Application['employee'],
    });

    expectFieldText('application-field-workingHours', /37,5\s+tuntia viikossa/);
    expectFieldText('application-field-monthlyPay', /2\s500,00\s€/);
    expectFieldText('application-field-vacationMoney', /200,00\s€/);
    expectFieldText('application-field-otherExpenses', /300,00\s€/);
  });

  it('renders fallback values for missing job title and missing dates', () => {
    renderView({
      startDate: undefined,
      endDate: undefined,
      employee: {
        jobTitle: '',
      } as Application['employee'],
    });

    expectFieldText('application-field-jobTitle', '-');
    expectFieldText('application-field-startDate', '-');
    expectFieldText('application-field-endDate', '-');
  });

  it('renders formatted start and end dates', () => {
    renderView({ startDate: '2026-05-01', endDate: '2026-10-31' });

    expectFieldText(
      'application-field-startDate',
      convertToUIDateFormat('2026-05-01')
    );
    expectFieldText(
      'application-field-endDate',
      convertToUIDateFormat('2026-10-31')
    );
  });

  it.each([
    { apprenticeshipProgram: true, expectedText: 'Kyllä' },
    { apprenticeshipProgram: false, expectedText: 'Ei' },
  ])(
    'renders apprenticeship program as $expectedText',
    ({ apprenticeshipProgram, expectedText }) => {
      renderView({ apprenticeshipProgram });

      expectFieldText('application-field-apprenticeshipProgram', expectedText);
    }
  );
});
