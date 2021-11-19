import { Checkbox as HdsCheckbox } from 'hds-react';
import noop from 'lodash/noop';
import React from 'react';
import {
  Controller,
  ControllerRenderProps,
  Path,
  useFormContext,
} from 'react-hook-form';
import useToggle from 'shared/hooks/useToggle';
import InputProps from 'shared/types/input-props';

const Checkbox = <T,>({
  id,
  registerOptions = {},
  onChange = noop,
  initialValue,
  label,
  errorText,
}: InputProps<T, boolean>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();
  const [selectedValue, toggleSelectedValue] = useToggle(initialValue);
  const required = Boolean(registerOptions.required);

  const handleChange = React.useCallback(
    (
      field: ControllerRenderProps<T, Path<T>>,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      toggleSelectedValue();
      field.onChange(event);
      return onChange(event.target.checked);
    },
    [onChange, toggleSelectedValue]
  );

  return (
    <Controller
      name={id}
      control={control}
      rules={registerOptions}
      render={({ field }) => (
        <HdsCheckbox
          {...field}
          id={id}
          data-testid={id}
          required={required}
          errorText={errorText}
          label={
            <>
              {label ?? ''}
              {required ? ' *' : ''}
            </>
          }
          onChange={(event) => handleChange(field, event)}
          checked={selectedValue}
        />
      )}
    />
  );
};

Checkbox.defaultProps = {
  onChange: noop,
};

export default Checkbox;
