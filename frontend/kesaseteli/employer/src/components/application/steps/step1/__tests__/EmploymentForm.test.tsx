import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import theme from 'shared/styles/theme';
import Application from 'shared/types/application';
import Employment from 'shared/types/employment';
import { ThemeProvider } from 'styled-components';

import EmploymentForm from '../EmploymentForm';

const mockFetchEmployment = jest.fn();
const mockUpdateApplication = jest.fn();

const getFetchEmployeeDataButton = (): HTMLElement =>
  screen.getByRole('button', {
    name: /common:application.step1.employment_section.fetch_employment/i,
  });

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));

jest.mock('kesaseteli/employer/hooks/application/useApplicationApi');

const renderWithProviders = (
  index: number,
  initialValues?: Partial<Employment>
): ReturnType<typeof render> => {
  const queryClient = new QueryClient();
  const Component: React.FC = () => {
    const methods = useForm<Application>({
      defaultValues: {
        summer_vouchers: [initialValues as Employment],
      },
      mode: 'onBlur',
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
    jest.clearAllMocks();
    (useApplicationApi as jest.Mock).mockReturnValue({
      fetchEmployment: mockFetchEmployment,
      updateApplication: mockUpdateApplication,
      applicationQuery: { data: { status: 'draft' } },
      applicationId: 'test-id',
    });
  });

  it('enables fetch employee data button for valid name and numeric voucher serial number', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: ' 123 ',
    });

    expect(getFetchEmployeeDataButton()).toBeEnabled();
  });

  it('disables fetch employee data button when serial number is non-numeric', async () => {
    renderWithProviders(0, {
      employee_name: '',
      summer_voucher_serial_number: '12A3',
    });

    await waitFor(() => {
      expect(getFetchEmployeeDataButton()).toBeDisabled();
    });
  });

  it('fetches employee data directly when voucher id already exists', async () => {
    const user = userEvent.setup();
    renderWithProviders(0, {
      id: 'voucher-id',
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
    });

    await user.click(getFetchEmployeeDataButton());

    expect(mockFetchEmployment).toHaveBeenCalledTimes(1);
    expect(mockFetchEmployment).toHaveBeenCalledWith(
      expect.objectContaining({
        summer_vouchers: expect.arrayContaining([
          expect.objectContaining({ id: 'voucher-id' }),
        ]),
      }),
      0,
      expect.any(Function)
    );
  });

  it('applies updated voucher from fetch callback and marks employee data as fetched', async () => {
    const user = userEvent.setup();

    mockFetchEmployment.mockImplementation(
      (
        _values: Application,
        _index: number,
        onSuccess: (app: Application) => void
      ) => {
        onSuccess({
          summer_vouchers: [
            {
              id: 'voucher-id',
              employee_phone_number: '0401234567',
              employment_postcode: '00100',
              employee_birthdate: '2000-01-01',
            } as Employment,
          ],
        } as Application);
      }
    );

    renderWithProviders(0, {
      id: 'voucher-id',
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
    });

    await user.click(getFetchEmployeeDataButton());

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          /common:application.form.inputs.employee_phone_number/i
        )
      ).toHaveValue('0401234567');
    });

    expect(
      screen.getByLabelText(/common:application.form.inputs.employee_name/i)
    ).toHaveAttribute('readOnly');
    expect(getFetchEmployeeDataButton()).toBeDisabled();
  });

  it('initially disables the second part of the form if no data is fetched', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
    });

    // The phone number field should be disabled
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).toBeDisabled();
  });

  it('activates the second part of the form and shows birthdate when employee_birthdate is present', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
      employee_birthdate: '2000-01-01',
    });

    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).toBeEnabled();

    const birthdateInput = screen.getByLabelText(
      /common:application.form.inputs.employee_birthdate/i
    );
    expect(birthdateInput).toHaveValue('1.1.2000');
    expect(birthdateInput).toHaveAttribute('readOnly');
  });

  describe('employment_postcode', () => {
    it.each(['00100', '01200', '20100', '33100'])(
      'preserves leading zeros and accepts valid postcode "%s"',
      async (postcode) => {
        renderWithProviders(0, {
          employee_name: 'Test',
          summer_voucher_serial_number: '123',
          employee_birthdate: '2000-01-01',
        });

        const input = screen.getByLabelText(
          /common:application.form.inputs.employment_postcode/i
        );
        await userEvent.clear(input);
        await userEvent.type(input, postcode);
        input.blur();

        expect(input).toHaveValue(postcode);
        await waitFor(() => {
          expect(
            screen.queryByText(/common:application.form.errors.pattern/i)
          ).not.toBeInTheDocument();
        });
        await waitFor(() => {
          expect(
            screen.queryByText(/common:application.form.errors.maxlength/i)
          ).not.toBeInTheDocument();
        });
      }
    );

    it('shows error for too long postcode "123456"', async () => {
      renderWithProviders(0, {
        employee_name: 'Test',
        summer_voucher_serial_number: '123',
        employee_birthdate: '2000-01-01',
      });

      const input = screen.getByLabelText(
        /common:application.form.inputs.employment_postcode/i
      );
      await userEvent.clear(input);
      await userEvent.type(input, '123456');
      input.blur();

      await waitFor(() => {
        expect(
          screen.getByText(/common:application.form.errors.maxlength/i)
        ).toBeInTheDocument();
      });
    });
  });

  it('activates the second part of the form when employee_phone_number is present', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
      employee_phone_number: '0401234567',
    });
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).toBeEnabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employment_postcode/i
      )
    ).toBeEnabled();
  });

  it('activates the second part of the form when employment_postcode is present', () => {
    renderWithProviders(0, {
      employee_name: 'Test',
      summer_voucher_serial_number: '123',
      employment_postcode: '00100',
    });
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employee_phone_number/i
      )
    ).toBeEnabled();
    expect(
      screen.getByLabelText(
        /common:application.form.inputs.employment_postcode/i
      )
    ).toBeEnabled();
  });
});
