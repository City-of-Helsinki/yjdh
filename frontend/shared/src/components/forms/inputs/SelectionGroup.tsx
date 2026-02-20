import { RadioButton, SelectionGroupProps } from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

import { $SelectionGroup } from './SelectionGroup.sc';

type Props<T> = Omit<InputProps<T>, 'label'> & {
  label?: string;
  direction?: SelectionGroupProps['direction'];
  values: readonly string[];
  getValueText: (value: string) => string;
  disabled?: boolean;
} & GridCellProps;

const SelectionGroup = <T,>({
  id,
  registerOptions,
  direction,
  values,
  initialValue,
  onChange = noop,
  label,
  errorText,
  getValueText,
  disabled = false,
  ...$gridCellProps
}: Props<T>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();

  const idString = id as string;

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        rules={registerOptions}
        control={control}
        render={({ field: { onChange: controllerOnChange, value, ref } }) => (
          <$SelectionGroup
            id={idString}
            data-testid={idString}
            direction={direction}
            errorText={errorText}
            label={label}
            disabled={disabled}
            required={Boolean(label && registerOptions?.required)}
          >
            {values.map((val) => (
              <RadioButton
                key={`${idString}-${val}`}
                id={`${idString}-${val}`}
                data-testid={`${idString}-${val}`}
                label={getValueText(val)}
                value={val}
                onChange={(event) => {
                  controllerOnChange(event.target.value);
                  onChange(event.target.value);
                }}
                checked={val === value}
                ref={ref}
                disabled={disabled}
              />
            ))}
          </$SelectionGroup>
        )}
      />
    </$GridCell>
  );
};

export default SelectionGroup;
