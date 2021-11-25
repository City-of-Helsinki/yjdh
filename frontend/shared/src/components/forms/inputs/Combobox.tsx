import { Combobox as HdsCombobox } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

type Option = {
  name: string;
};

type Props<T, O extends Option> = InputProps<T, O> &
  GridCellProps & {
    optionLabelField: keyof O;
    options: O[];
  };

const Combobox = <T, O extends Option>({
  id,
  registerOptions = {},
  initialValue,
  label,
  optionLabelField,
  options,
  disabled,
  placeholder,
  errorText,
  onChange,
  ...$gridCellProps
}: Props<T, O>): React.ReactElement<T> => {
  const { t } = useTranslation();
  const { control } = useFormContext<T>();
  const required = Boolean(registerOptions.required);

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        control={control}
        rules={registerOptions}
        render={({ field }) => (
          <HdsCombobox<O>
            {...field}
            id={id}
            data-testid={id}
            required={required}
            label={label}
            defaultValue={initialValue}
            placeholder={placeholder}
            toggleButtonAriaLabel={t('common:assistive.toggleMenu')}
            optionLabelField={optionLabelField as string}
            options={options}
            disabled={disabled}
            invalid={Boolean(errorText)}
            aria-invalid={Boolean(errorText)}
          />
        )}
      />
      {errorText && <FieldErrorMessage>{errorText}</FieldErrorMessage>}
    </$GridCell>
  );
};

Combobox.defaultProps = {};

export default Combobox;
