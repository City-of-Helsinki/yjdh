import { FinnishSSN } from 'finnish-ssn';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

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
  const { register } = useFormContext<T>();

  const capitalizeAndTrimSocialSecurityNumber = React.useCallback(
    (ssn: unknown) => {
      if (typeof ssn === 'string') {
        return ssn.trim().toUpperCase();
      }
      return ssn;
    },
    []
  );

  const validateSocialSecurityNumber = React.useCallback(
    (ssn: unknown) => {
      const capitalizedSsn = capitalizeAndTrimSocialSecurityNumber(ssn);
      if (capitalizedSsn && typeof capitalizedSsn === 'string') {
        return FinnishSSN.validate(capitalizedSsn);
      }
      return false;
    },
    [capitalizeAndTrimSocialSecurityNumber]
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
        aria-invalid={Boolean(errorText)}
      />
    </$GridCell>
  );
};

SocialSecurityNumberInput.defaultProps = {
  placeholder: undefined,
};

export default SocialSecurityNumberInput;
