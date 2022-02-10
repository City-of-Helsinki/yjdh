import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { Controller, useFormContext } from 'react-hook-form';
import { Combobox as HdsCombobox } from 'hds-react';
import Id from 'shared/types/id';
import { RegisterOptions } from 'react-hook-form';

type Props<O extends Option> = {
  id: Id<TetPosting>;
  initialValue?: O;
  label: React.ReactNode;
  options: O[];
  placeholder: string;
  multiselect?: boolean;
  validation?: RegisterOptions<TetPosting>;
  filter: (options: O[], search: string) => O[];
  optionLabelField: keyof O;
  disabled: boolean;
  required: boolean;
};

export type Option = {
  name: string;
};

const Combobox = <O extends Option>({
  id,
  multiselect = false,
  filter,
  validation = {},
  label,
  optionLabelField,
  options,
  placeholder,
  disabled = false,
  required = false,
}: Props<O>): React.ReactElement<TetPosting> => {
  const { control } = useFormContext<TetPosting>();

  return (
    <Controller
      name={id}
      data-testid={id}
      control={control}
      rules={validation}
      render={({ field: { ref, value, onChange, ...field }, fieldState: { error, invalid, ...fieldState } }) => (
        <HdsCombobox<O>
          {...field}
          value={value}
          id={id}
          multiselect={multiselect}
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

export default Combobox;
