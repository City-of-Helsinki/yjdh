import { Select } from 'hds-react';
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

type HdsOption = {
  label: string;
  value: string;
};

type Props<T extends FieldValues, O extends Option> = InputProps<T, O> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
  };
const Dropdown = <T extends FieldValues, O extends Option>({
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
  ...$gridCellProps
}: Props<T, O>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();
  const required = Boolean(registerOptions.required);
  const inputId = String(id);
  // HDS Select takes string options, but the form still stores O.
  const getOptionValue = (option: O): string =>
    String(option[optionLabelField]);
  // Translate between app domain objects and the string-only HDS option shape.
  const hdsOptions: HdsOption[] = options.map((option) => {
    const value = getOptionValue(option);
    return { label: value, value };
  });
  const selectedValue = initialValue ? getOptionValue(initialValue) : undefined;

  const handleChange = (
    selectedOptions: HdsOption[] | undefined,
    controllerOnChange: (value: O | null) => void
  ): void => {
    const newSelectedValue = selectedOptions?.[0]?.value;
    const nextValue =
      options.find((option) => getOptionValue(option) === newSelectedValue) ??
      null;
    controllerOnChange(nextValue);
    onChange?.(nextValue ?? undefined);
  };

  const sharedSelectProps = {
    'data-testid': inputId,
    id: inputId,
    required,
    label: label || '',
    defaultValue: selectedValue,
    placeholder,
    options: hdsOptions,
    disabled,
    invalid: Boolean(errorText),
  };

  return (
    <$GridCell {...$gridCellProps}>
      <$DropdownWrapper errorText={errorText}>
        <Controller
          name={id}
          data-testid={inputId}
          control={control}
          rules={registerOptions}
          render={({
            field: { ref, value, onChange: controllerOnChange, ...field },
          }) => {
            const currentSelectedValue = value
              ? getOptionValue(value as O)
              : undefined;

            return (
              <Select
                {...field}
                {...sharedSelectProps}
                value={currentSelectedValue}
                onChange={(selectedOptions: HdsOption[]) =>
                  handleChange(selectedOptions, controllerOnChange)
                }
              />
            );
          }}
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
