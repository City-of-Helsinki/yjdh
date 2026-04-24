import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import MultiSelectDropdown from 'shared/components/forms/inputs/MultiSelectDropdown';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import InputProps from 'shared/types/input-props';
import { ThemeProvider } from 'styled-components';

type Option = {
  name: string;
  code: string;
};

type FormValues = {
  cities: Option[];
};

type MultiSelectDropdownTestProps<
  T extends FieldValues,
  O extends Option
> = InputProps<T, O[]> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
  };

const options: Option[] = [
  { name: 'Helsinki', code: '00100' },
  { name: 'Espoo', code: '02100' },
  { name: 'Vantaa', code: '01300' },
];

const renderComponent = (
  props: Partial<MultiSelectDropdownTestProps<FormValues, Option>> = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const methods = useForm<FormValues>({
      defaultValues: {
        cities: [],
      },
    });

    return (
      <ThemeProvider theme={theme}>
        <FormProvider {...methods}>{children}</FormProvider>
      </ThemeProvider>
    );
  };

  return render(
    <MultiSelectDropdown<FormValues, Option>
      id="cities"
      label="Cities"
      optionLabelField="name"
      options={options}
      {...props}
    />,
    { wrapper: Wrapper }
  );
};

const getCombobox = (label = /cities/i): HTMLElement =>
  screen.getByRole('combobox', { name: label });

const openCombobox = async (
  user: ReturnType<typeof userEvent.setup>,
  label = /cities/i
): Promise<void> => {
  await user.click(getCombobox(label));
};

describe('MultiSelectDropdown', () => {
  it('has an accessible label on the combobox button', () => {
    renderComponent();

    expect(getCombobox()).toHaveAccessibleName(/cities/i);
  });

  it('renders menu options when opened', async () => {
    const user = userEvent.setup();
    renderComponent();

    await openCombobox(user);

    expect(
      await screen.findByRole('option', { name: 'Helsinki' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Espoo' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vantaa' })).toBeInTheDocument();
  });

  it('maps selected options back to domain objects in onChange', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    renderComponent({ onChange: handleChange });

    await openCombobox(user);
    await user.click(await screen.findByRole('option', { name: 'Helsinki' }));
    await user.click(screen.getByRole('option', { name: 'Espoo' }));

    expect(handleChange).toHaveBeenCalledWith([options[0]]);
    expect(handleChange).toHaveBeenCalledWith([options[0], options[1]]);
  });

  it('shows error message', () => {
    renderComponent({
      errorText: 'At least one city is required',
      registerOptions: { required: true },
    });

    expect(getCombobox()).toBeInTheDocument();
    expect(screen.getByTestId('cities-error')).toHaveTextContent(
      'At least one city is required'
    );
  });

  it('renders disabled combobox when disabled prop is true', () => {
    renderComponent({ disabled: true });

    expect(getCombobox()).toHaveAttribute('aria-disabled', 'true');
  });

  it('commits draft state to form value on menu close', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    renderComponent({ onChange: handleChange });

    await openCombobox(user);
    await user.click(await screen.findByRole('option', { name: 'Helsinki' }));
    await user.click(screen.getByRole('option', { name: 'Espoo' }));

    // Close the menu by pressing Escape
    await user.keyboard('{Escape}');

    // Verify onChange was called with correct values
    expect(handleChange).toHaveBeenLastCalledWith([options[0], options[1]]);
  });
});
