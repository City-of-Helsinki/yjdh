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

type Props<T> = Omit<InputProps<T>, 'onChange'> &
  Required<{ onChange: InputProps<T>['onChange'] }> &
  GridCellProps;

/**
 * NOTE: Since the HDS DateInput has a compatibility issue with React-hook-forms,
 * The onChange should include processes to
 * 1) clear the input validation errors and
 * 2) set the input value.
 * Otherwise the errors are not cleared when a datepicker is used.
 *
 * FIXME: This should change when the HDS is upgraded to the v. 3.0.0.
 */
const DateInput = <T,>({
  id,
  registerOptions,
  // NOTE: the onChange is currently not in the same format
  // as the HDS dateinput is expecting it to be.
  // HDS DateInputProps are waiting for (value: string, valueAsDate: Date),
  // but onChange from the InputProps is (value: string).
  // It should also be noted that the React-Hook-Forms wants the OnChange
  // to be called with a SyntheticEvent.
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
  const reactHookFormProps = register(id, {
    ...registerOptions,
    validate,
    // NOTE: it may be so that the onChange and onBlur
    // of the React-hook-forms should be called
    // with the given onChange prop.
    // There is just a problem that they needs a SyntheticEvent,
    // that the current version of HDS does not support in it's date input.
    // This will change in HDS v.3.0.0.
    // onChange(event) {},
    // onBlur(event) {},
  });

  return (
    <$GridCell {...$gridCellProps}>
      <$DateInput
        {...reactHookFormProps}
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

export default DateInput;
