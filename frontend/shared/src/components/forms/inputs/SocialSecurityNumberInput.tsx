import { FinnishSSN } from 'finnish-ssn';
import React from 'react';
import { FieldError, get, useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { FINNISH_SSN_REGEX } from 'shared/constants';
import InputProps from 'shared/types/input-props';
import { isString } from 'shared/utils/type-guards';

import { $TextInput } from './TextInput.sc';

type Props<T> = Omit<InputProps<T>, 'onChange'> & {
  placeholder?: string;
};

const SocialSecurityNumberInput = <T,>({
  id,
  initialValue,
  placeholder,
  label,
  errorText,
  registerOptions = {},
  ...$gridCellProps
}: Props<T>): React.ReactElement<T> => {
  const { register, formState, clearErrors } = useFormContext<T>();

  const capitalizeAndTrimSocialSecurityNumber = React.useCallback(
    (ssn: unknown) => {
      if (isString(ssn)) {
        return ssn.trim().toUpperCase();
      }
      return ssn;
    },
    []
  );

  const validateSocialSecurityNumber = React.useCallback(
    (ssn: unknown) => {
      const capitalizedSsn = capitalizeAndTrimSocialSecurityNumber(ssn);
      if (
        capitalizedSsn &&
        isString(capitalizedSsn) &&
        FINNISH_SSN_REGEX.test(capitalizedSsn)
      ) {
        return FinnishSSN.validate(capitalizedSsn);
      }
      return false;
    },
    [capitalizeAndTrimSocialSecurityNumber]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (event) => {
        const error = get(formState.errors, id) as FieldError | undefined;
        if (error && validateSocialSecurityNumber(event.target.value)) {
          clearErrors(id);
        }
      },
      [formState.errors, id, validateSocialSecurityNumber, clearErrors]
    );

  return (
    <$GridCell {...$gridCellProps}>
      <$TextInput
        {...register(id, {
          setValueAs: capitalizeAndTrimSocialSecurityNumber,
          validate: validateSocialSecurityNumber,
          ...registerOptions,
        })}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        placeholder={placeholder}
        required={Boolean(registerOptions.required)}
        defaultValue={initialValue}
        errorText={errorText}
        label={label}
        invalid={Boolean(errorText)}
        {...(process.env.NODE_ENV !== 'test' && { onChange: handleChange })}
        aria-invalid={Boolean(errorText)}
      />
    </$GridCell>
  );
};

SocialSecurityNumberInput.defaultProps = {
  placeholder: undefined,
};

export default SocialSecurityNumberInput;
