import { Combobox as HdsCombobox } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import Id from 'shared/types/id';

type Props<T, O extends Option> = {
  id: Id<T>;
  testId?: string;
  initialValue?: O;
  label: React.ReactNode;
  options: O[];
  placeholder: string;
  validation?: RegisterOptions<T>;
  filter: (options: O[], search: string) => O[];
  optionLabelField: keyof O;
  disabled?: boolean;
  required: boolean;
};

export type Option = {
  name: string;
};

const ComboboxSingleSelect = <T, O extends Option>({
  id,
  testId,
  filter,
  validation = {},
  label,
  optionLabelField,
  options,
  placeholder,
  disabled = false,
  required = false,
}: Props<T, O>): React.ReactElement<T> => {
  const { control } = useFormContext<T>();
  const { t } = useTranslation();

  return (
    <Controller
      name={id}
      data-testid={id}
      control={control}
      rules={validation}
      render={({ field: { ref, value, onChange, ...field }, fieldState: { error, invalid } }) => (
        <HdsCombobox<O>
          {...field}
          data-testid={testId}
          value={value as O}
          id={id}
          required={required}
          label={label}
          placeholder={placeholder}
          optionLabelField={optionLabelField as string}
          options={options}
          onChange={onChange}
          disabled={disabled}
          error={error && error.message ? error.message : ''}
          invalid={Boolean(invalid)}
          aria-invalid={Boolean(error)}
          filter={filter}
          toggleButtonAriaLabel={t('common:editor.combobox.toggleButtonAriaLabel')}
        />
      )}
    />
  );
};

ComboboxSingleSelect.defaultProps = {
  testId: undefined,
  initialValue: undefined,
  validation: {},
  disabled: false,
};

export default ComboboxSingleSelect;
