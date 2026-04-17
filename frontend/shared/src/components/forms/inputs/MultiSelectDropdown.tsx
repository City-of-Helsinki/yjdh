import { Select } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

type Option = {
  name: string;
};

type Props<T extends FieldValues, O extends Option> = InputProps<T, O[]> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
  };

const MultiSelectDropdown = <T extends FieldValues, O extends Option>({
  type = 'select',
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
  const inputId = String(id);

  const sharedProps = {
    multiselect: true as const,
    id: inputId,
    required,
    label,
    defaultValue: initialValue,
    placeholder,
    selectedItemRemoveButtonAriaLabel: t('common:assistive.clearChoice'),
    clearButtonAriaLabel: t('common:assistive.clearChoices'),
    optionLabelField: optionLabelField as string,
    options,
    disabled,
    invalid: Boolean(errorText),
    'aria-invalid': Boolean(errorText),
  };

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        data-testid={inputId}
        control={control}
        rules={registerOptions}
        render={({ field: { ref, value, ...field } }) =>
          type === 'combobox' ? (
            <Select {...field} {...sharedProps} value={value as O[]} />
          ) : (
            <Select {...field} {...sharedProps} value={value as O[]} />
          )
        }
      />
      {errorText && (
        <FieldErrorMessage data-testid={`${inputId}-error`}>
          {errorText}
        </FieldErrorMessage>
      )}
    </$GridCell>
  );
};

export default MultiSelectDropdown;
