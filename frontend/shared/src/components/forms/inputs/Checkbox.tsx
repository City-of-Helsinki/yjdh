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
  const { control, setError, clearErrors } = useFormContext<T>();
  const [selectedValue, toggleSelectedValue] = useToggle(initialValue);
  const required = Boolean(registerOptions.required);

  const handleChange = React.useCallback(
    (
      field: ControllerRenderProps<T, Path<T>>,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      toggleSelectedValue();
      const value = Boolean(event.target.checked);
      if (required && !value) {
        setError(id, { type: 'required' });
      } else if (required && value) {
        clearErrors();
      }
      field.onChange(event);
      return onChange(value);
    },
    [onChange, toggleSelectedValue, clearErrors, id, required, setError]
  );

  return (
    <Controller
      name={id}
      control={control}
      rules={registerOptions}
      render={({ field }) => (
        <HdsCheckbox
          {...field}
          data-testid={id}
          id={id}
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
