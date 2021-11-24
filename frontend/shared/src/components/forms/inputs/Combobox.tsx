import { Combobox as HdsCombobox } from 'hds-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

type Props<T, O> = InputProps<T, O> &
  GridCellProps & {
    optionLabelField: keyof O;
    options: O[];
  };

const Combobox = <T, O>({
  id,
  registerOptions = {},
  initialValue,
  label,
  onChange,
  optionLabelField,
  options,
  ...$gridCellProps
}: Props<T, O>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();
  const required = Boolean(registerOptions.required);

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        control={control}
        rules={registerOptions}
        render={({ field }) => (
          <HdsCombobox
            {...field}
            id={id}
            data-testid={id}
            required={required}
            label={label}
            defaultValue={initialValue}
            placeholder="Valitse koulusi listalta"
            toggleButtonAriaLabel="Toggle menu"
            optionLabelField={optionLabelField as string}
            options={options}
          />
        )}
      />
    </$GridCell>
  );
};

Combobox.defaultProps = {};

export default Combobox;
