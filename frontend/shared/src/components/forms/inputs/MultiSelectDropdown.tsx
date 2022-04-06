import { Combobox, Select } from 'hds-react';
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

type Props<T, O extends Option> = InputProps<T, O[]> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
  };

const MultiSelectDropdown = <T, O extends Option>({
  type = 'select',
  multiselect,
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
  const DropdownInput = React.useMemo(
    () => (type === 'select' ? Select : Combobox),
    [type]
  );

  return (
    <$GridCell {...$gridCellProps}>
      <Controller
        name={id}
        data-testid={id}
        control={control}
        rules={registerOptions}
        render={({ field: { ref, value, ...field } }) => (
          <DropdownInput<O>
            {...field}
            multiselect
            value={value as O[]}
            id={id}
            required={required}
            label={label}
            defaultValue={initialValue}
            placeholder={placeholder}
            selectedItemRemoveButtonAriaLabel={t(
              'common:assistive.clearChoice'
            )}
            clearButtonAriaLabel={t('common:assistive.clearChoices')}
            optionLabelField={optionLabelField as string}
            options={options}
            disabled={disabled}
            invalid={Boolean(errorText)}
            aria-invalid={Boolean(errorText)}
          />
        )}
      />
      {errorText && (
        <FieldErrorMessage data-testid={`${id as string}-error`}>
          {errorText}
        </FieldErrorMessage>
      )}
    </$GridCell>
  );
};

MultiSelectDropdown.defaultProps = {
  type: 'select',
  multiselect: false,
};

export default MultiSelectDropdown;
