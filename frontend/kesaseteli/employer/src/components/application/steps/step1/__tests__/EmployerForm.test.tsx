import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useOfficesQuery from 'kesaseteli/employer/hooks/backend/useOfficesQuery';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import ApplicationFormData from 'kesaseteli-shared/types/application-form-data';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import EmployerForm from '../EmployerForm';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('kesaseteli/employer/hooks/application/useIsForeignIban', () => () => false);
jest.mock('kesaseteli/employer/hooks/backend/useOfficesQuery');

const renderWithProviders = (
  initialValues?: Partial<ApplicationFormData>
): ReturnType<typeof render> => {
  const queryClient = new QueryClient();
  const Component: React.FC = () => {
    const methods = useForm<ApplicationFormData>({
      defaultValues: initialValues,
      mode: 'onBlur',
    });
    return (
      <BackendAPIProvider baseURL={getBackendDomain()}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <FormProvider {...methods}>
              <EmployerForm />
            </FormProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BackendAPIProvider>
    );
  };
  return render(<Component />);
};

describe('EmployerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOfficesQuery as jest.Mock).mockReturnValue({
      data: [{ name: 'Helsinki Office' }, { name: 'Espoo Office' }],
    });
  });

  it('renders office Search input and cost_center TextInput', () => {
    renderWithProviders({
      office: 'Helsinki Office',
      cost_center: '12345',
    });

    expect(
      screen.getByRole('combobox', {
        name: /common:application.form.inputs.office/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /common:application.form.inputs.cost_center/i,
      })
    ).toBeInTheDocument();
  });

  it('allows typing into Cost Office field', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const costCenterInput = screen.getByRole('textbox', {
      name: /common:application.form.inputs.cost_center/i,
    });
    await user.type(costCenterInput, 'CostOffice100');
    expect(costCenterInput).toHaveValue('CostOffice100');
  });

  it('displays search suggestions when offices are string array', async () => {
    (useOfficesQuery as jest.Mock).mockReturnValue({
      data: ['Helsinki Office', 'Espoo Office'],
    });

    renderWithProviders();

    const officeSearchInput = screen.getByRole('combobox', {
      name: /common:application.form.inputs.office/i,
    });
    await userEvent.type(officeSearchInput, 'Hel');
    await waitFor(() => {
      expect(screen.getByRole('option')).toHaveTextContent('Helsinki Office');
    });
  });

  it('displays search suggestions when offices are object array', async () => {
    (useOfficesQuery as jest.Mock).mockReturnValue({
      data: [{ name: 'Helsinki Office' }, { name: 'Espoo Office' }],
    });

    renderWithProviders();

    const officeSearchInput = screen.getByRole('combobox', {
      name: /common:application.form.inputs.office/i,
    });
    await userEvent.type(officeSearchInput, 'Esp');
    await waitFor(() => {
      expect(screen.getByRole('option')).toHaveTextContent('Espoo Office');
    });
  });
});
