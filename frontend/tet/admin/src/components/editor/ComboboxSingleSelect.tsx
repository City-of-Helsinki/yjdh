import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { Controller, useFormContext } from 'react-hook-form';
import { Combobox as HdsCombobox } from 'hds-react';
import Id from 'shared/types/id';
import { RegisterOptions, NestedValue } from 'react-hook-form';

type ComboboxFields<O extends Option> = {
  location: NestedValue<O>;
};

type Props<T, O extends Option> = {
  id: Id<T>;
  initialValue?: O;
  label: React.ReactNode;
  options: O[];
  placeholder: string;
  validation?: RegisterOptions<T>;
  filter: any;
  optionLabelField: keyof O;
  disabled?: boolean;
  required: boolean;
};

export type Option = {
  name: string;
};

const ComboboxSingleSelect = <T, O extends Option>({
  id,
  filter,
  validation = {},
  label,
  optionLabelField,
  options,
  placeholder,
  disabled = false,
  required = false,
}: Props<T, O>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={id}
      data-testid={id}
      control={control}
      rules={validation}
      render={({ field: { ref, value, onChange, ...field }, fieldState: { error, invalid, ...fieldState } }) => (
        <HdsCombobox<O>
          {...field}
          value={value as O}
          id={id}
          required={required}
          label={label}
          placeholder={placeholder}
          optionLabelField={optionLabelField as string}
          options={options}
          onChange={onChange}
          disabled={disabled}
          error={error && error.message ? error.message : ''}
          invalid={Boolean(invalid)}
          aria-invalid={Boolean(error)}
          filter={filter}
          toggleButtonAriaLabel="test"
          clearButtonAriaLabel="test"
          selectedItemRemoveButtonAriaLabel="test"
        />
      )}
    />
  );
};

export default ComboboxSingleSelect;
