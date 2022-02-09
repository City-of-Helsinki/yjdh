import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { Controller, useFormContext } from 'react-hook-form';
import { Combobox as HdsCombobox } from 'hds-react';
import Id from 'shared/types/id';
import { OptionType } from 'tet/admin/types/classification';
import { RegisterOptions } from 'react-hook-form';

type Props = {
  id: Id<TetPosting>;
  initialValue?: number;
  label: string;
  options: OptionType[];
  placeholder: string;
  multiselect?: boolean;
  validation?: RegisterOptions<TetPosting>;
  filter?: any;
  optionLabelField: string;
  disabled?: boolean;
  required?: boolean;
};

const Combobox: React.FC<Props> = ({
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
}) => {
  const { control } = useFormContext<TetPosting>();
  return (
    <Controller
      name={id}
      data-testid={id}
      control={control}
      rules={validation}
      render={({ field: { ref, value, onChange, ...field }, fieldState: { error, invalid, ...fieldState } }) => (
        <HdsCombobox
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
          invalid={invalid}
          aria-invalid={error && error.message ? error.message : ''}
          filter={filter}
        />
      )}
    />
  );
};

export default Combobox;
