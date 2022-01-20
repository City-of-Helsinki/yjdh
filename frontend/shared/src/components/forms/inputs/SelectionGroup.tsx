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
  ...$gridCellProps
}: Props<T>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();
  const [selectedValue, setSelectedValue] = React.useState(initialValue);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
      setSelectedValue(event.target.value);
    },
    [setSelectedValue, onChange]
  );

  const idString = id as string;

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        rules={registerOptions}
        control={control}
        render={({ field: { ref, value, ...fieldProps } }) => (
          <$SelectionGroup
            {...fieldProps}
            id={id}
            data-testid={id}
            name={id}
            required={Boolean(label && registerOptions?.required)}
            direction={direction}
            errorText={errorText}
            label={label}
          >
            {values.map((val) => (
              <RadioButton
                key={`${idString}-${val}`}
                id={`${idString}-${val}`}
                data-testid={`${idString}-${val}`}
                label={getValueText(val)}
                value={val}
                onChange={handleChange}
                checked={val === selectedValue}
              />
            ))}
          </$SelectionGroup>
        )}
      />
    </$GridCell>
  );
};

SelectionGroup.defaultProps = {
  direction: 'horizontal',
  label: undefined,
};

export default SelectionGroup;
