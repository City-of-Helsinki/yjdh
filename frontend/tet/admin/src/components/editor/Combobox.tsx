import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { Controller, useFormContext } from 'react-hook-form';
import { Combobox as HdsCombobox } from 'hds-react';
import Id from 'shared/types/id';
import { OptionType } from 'tet/admin/types/classification';
import { RegisterOptions } from 'react-hook-form';

type FilterFunction<OptionType> = (options: OptionType[], search: string) => OptionType[];

type Props = {
  id: Id<TetPosting>;
  initialValue?: number;
  label: string;
  options: OptionType[];
  placeholder: string;
  multiselect: boolean;
  validation?: RegisterOptions<TetPosting>;
  filter?: any;
  optionLabelField: string;
  disabled: boolean;
  required: boolean;
  onChange: (val) => void;
};

const Combobox: React.FC<Props> = ({
  id,
  multiselect = false,
  filter,
  validation = {},
  label,
  initialValue,
  optionLabelField,
  options,
  placeholder,
  onChange,
  disabled = false,
  required = false,
}) => {
  const { control, setValue, getValues } = useFormContext<TetPosting>();
  const test = (val) => {
    setValue('keywords', [...val]);
  };
  return (
    <Controller
      name={id}
      data-testid={id}
      control={control}
      rules={validation}
      render={({ field: { ref, value, ...field }, fieldState: { error, invalid, ...fieldState } }) => (
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
          errorText={error && error.message ? error.message : ''}
          invalid={invalid}
          aria-invalid={error && error.message ? error.message : ''}
          filter={filter}
        />
      )}
    />
  );
};

export default Combobox;
