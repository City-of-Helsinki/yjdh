import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import useLocale from 'shared/hooks/useLocale';
import InputProps from 'shared/types/input-props';
import { isValidDate, parseDate } from 'shared/utils/date.utils';
import { isString } from 'shared/utils/type-guards';

import { $DateInput } from './DateInput.sc';

type Props<T> = InputProps<T> & GridCellProps;

const DateInput = <T,>({
  id,
  registerOptions,
  onChange,
  initialValue,
  errorText,
  label,
  ...$gridCellProps
}: Props<T>): React.ReactElement<T> => {
  const locale = useLocale();
  const { register } = useFormContext<T>();

  const validate = React.useCallback(
    (value) => isString(value) && isValidDate(parseDate(value)),
    []
  );

  return (
    <$GridCell {...$gridCellProps}>
      <$DateInput
        {...register(id, {
          ...registerOptions,
          validate,
        })}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        required={Boolean(registerOptions?.required)}
        initialMonth={new Date()}
        defaultValue={initialValue}
        language={locale}
        // for some reason date picker causes error "Warning: An update to ForwardRef inside a test was not wrapped in act" in tests.
        // Date picker is not needed for tests so it's disabled for them.
        disableDatePicker={process.env.NODE_ENV === 'test'}
        onChange={onChange}
        errorText={errorText}
        label={label}
        invalid={Boolean(errorText)}
        aria-invalid={Boolean(errorText)}
      />
    </$GridCell>
  );
};

DateInput.defaultProps = {
  errorText: undefined,
};
export default DateInput;
