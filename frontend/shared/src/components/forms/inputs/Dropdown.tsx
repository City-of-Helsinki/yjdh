import { Combobox, Select } from 'hds-react';
import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

import FieldErrorMessage from '../fields/fieldErrorMessage/FieldErrorMessage';
import { $DropdownWrapper } from './Dropdown.sc';

type Option = {
  name: string;
};

type Props<T extends FieldValues, O extends Option> = InputProps<T, O> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
    toggleButtonAriaLabel?: string;
  };

const Dropdown = <T extends FieldValues, O extends Option>({
  type = 'select',
  multiselect,
  id,
  registerOptions = {},
  initialValue,
  label,
  optionLabelField,
  options,
  disabled,
  placeholder,
  errorText,
  onChange,
  toggleButtonAriaLabel,
  ...$gridCellProps
}: Props<T, O>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();
  const required = Boolean(registerOptions.required);
  const inputId = String(id);

  const sharedProps = {
    id: inputId,
    required,
    label: label || '',
    defaultValue: initialValue,
    placeholder,
    optionLabelField: optionLabelField as string,
    options,
    disabled,
    invalid: Boolean(errorText),
    'aria-invalid': Boolean(errorText),
    errorText,
  };

  return (
    <$GridCell {...$gridCellProps}>
      <$DropdownWrapper errorText={errorText}>
        <Controller
          name={id}
          data-testid={inputId}
          control={control}
          rules={registerOptions}
          render={({ field: { ref, value, ...field } }) =>
            type === 'combobox' ? (
              <Combobox<O>
                {...field}
                {...sharedProps}
                value={value as O}
                toggleButtonAriaLabel={toggleButtonAriaLabel || ''}
              />
            ) : (
              <Select<O> {...field} {...sharedProps} value={value as O} />
            )
          }
        />
        {errorText && (
          <FieldErrorMessage data-testid={`${inputId}-error`}>
            {errorText}
          </FieldErrorMessage>
        )}
      </$DropdownWrapper>
    </$GridCell>
  );
};

export default Dropdown;
