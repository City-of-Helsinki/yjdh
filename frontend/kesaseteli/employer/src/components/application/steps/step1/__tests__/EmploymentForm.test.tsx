import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import EmploymentForm from '../EmploymentForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import theme from 'shared/styles/theme';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));

jest.mock('kesaseteli/employer/hooks/application/useApplicationApi');

const renderWithProviders = (index: number, initialValues?: any) => {
  const queryClient = new QueryClient();
  const Component = () => {
    const methods = useForm({
      defaultValues: {
        summer_vouchers: [initialValues],
      },
    });
    return (
      <BackendAPIProvider baseURL={getBackendDomain()}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <FormProvider {...methods}>
              <EmploymentForm index={index} />
            </FormProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BackendAPIProvider>
    );
  };
  return render(<Component />);
};

describe('EmploymentForm', () => {
  beforeEach(() => {
    (useApplicationApi as jest.Mock).mockReturnValue({
      fetchEmployment: jest.fn(),
      updateApplication: jest.fn(),
      applicationQuery: { data: { status: 'draft' } },
      applicationId: 'test-id',
    });
  });

  it('initially disables the second part of the form if no data is fetched', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
    });

    // The SSN field should be disabled
    expect(
      screen.getByLabelText(/common:application.form.inputs.employee_ssn/i)
    ).toBeDisabled();
    // The phone number field should be disabled
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).toBeDisabled();
  });

  it('activates the second part of the form when employee_ssn is present', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
      employee_ssn: '010101-123A',
    });

    expect(
      screen.getByLabelText(/common:application.form.inputs.employee_ssn/i)
    ).not.toBeDisabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).not.toBeDisabled();
  });

  it('activates the second part of the form when employee_phone_number is present (even if SSN is missing)', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
      employee_phone_number: '0401234567',
    });

    expect(
      screen.getByLabelText(/common:application.form.inputs.employee_ssn/i)
    ).not.toBeDisabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).not.toBeDisabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employment_postcode/i
      )
    ).not.toBeDisabled();
  });

  it('activates the second part of the form when employment_postcode is present (even if SSN is missing)', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
      employment_postcode: '00100',
    });

    expect(
      screen.getByLabelText(/common:application.form.inputs.employee_ssn/i)
    ).not.toBeDisabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).not.toBeDisabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employment_postcode/i
      )
    ).not.toBeDisabled();
  });
});
