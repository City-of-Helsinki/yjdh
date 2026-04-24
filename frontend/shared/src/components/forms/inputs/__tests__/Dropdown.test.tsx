import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import Dropdown from 'shared/components/forms/inputs/Dropdown';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import InputProps from 'shared/types/input-props';
import { ThemeProvider } from 'styled-components';

type Option = {
  name: string;
  code: string;
};

type FormValues = {
  city: Option | null;
};

type DropdownTestProps<T extends FieldValues, O extends Option> = InputProps<
  T,
  O
> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
  };

const options: Option[] = [
  { name: 'Helsinki', code: '00100' },
  { name: 'Espoo', code: '02100' },
];

const renderDropdown = (
  props: Partial<DropdownTestProps<FormValues, Option>> = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const methods = useForm<FormValues>({
      defaultValues: {
        city: null,
      },
    });

    return (
      <ThemeProvider theme={theme}>
        <FormProvider {...methods}>{children}</FormProvider>
      </ThemeProvider>
    );
  };

  return render(
    <Dropdown<FormValues, Option>
      id="city"
      label="City"
      optionLabelField="name"
      options={options}
      {...props}
    />,
    { wrapper: Wrapper }
  );
};

const getCombobox = (label = /city/i): HTMLElement =>
  screen.getByRole('combobox', { name: label });

const openCombobox = async (
  user: ReturnType<typeof userEvent.setup>,
  label = /city/i
): Promise<void> => {
  await user.click(getCombobox(label));
};

describe('Dropdown', () => {
  it('has an accessible label on the combobox button', () => {
    renderDropdown();

    const combobox = getCombobox();

    expect(combobox).toHaveAccessibleName(/city/i);
  });

  it('renders combobox', () => {
    renderDropdown({
      initialValue: options[1],
    });

    const combobox = getCombobox();
    expect(combobox).toBeInTheDocument();
  });

  it('maps selected option back to domain object in onChange', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();

    renderDropdown({
      onChange: handleChange,
    });

    await openCombobox(user);
    await user.click(await screen.findByRole('option', { name: 'Helsinki' }));

    expect(handleChange).toHaveBeenCalledWith(options[0]);
  });

  it('renders menu options when opened', async () => {
    const user = userEvent.setup();
    renderDropdown();

    await openCombobox(user);

    expect(
      await screen.findByRole('option', { name: 'Helsinki' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Espoo' })).toBeInTheDocument();
  });

  it('shows error message and invalid state', () => {
    renderDropdown({
      errorText: 'City is required',
      registerOptions: { required: true },
    });

    const combobox = getCombobox();
    expect(combobox).toBeInTheDocument();
    expect(screen.getByTestId('city-error')).toHaveTextContent(
      'City is required'
    );
  });

  it('renders a disabled combobox when disabled prop is true', () => {
    renderDropdown({ disabled: true });

    const combobox = getCombobox();
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
  });
});
