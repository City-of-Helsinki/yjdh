import { Combobox as HdsCombobox } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, NestedValue, RegisterOptions, useFormContext } from 'react-hook-form';
import Id from 'shared/types/id';
import { Option } from 'tet-shared/types/classification';

type ComboboxFields<O extends Option> = {
  keywords: NestedValue<O[]>;
};

type Props<O extends Option> = {
  id: Id<ComboboxFields<O>>;
  testId?: string;
  initialValue?: O;
  label: React.ReactNode;
  options: O[];
  placeholder: string;
  multiselect?: boolean;
  validation?: RegisterOptions<ComboboxFields<O>>;
  filter: (options: O[], search: string) => O[];
  optionLabelField: keyof O;
  disabled?: boolean;
  required: boolean;
};

const Combobox = <O extends Option>({
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
}: Props<O>): React.ReactElement<ComboboxFields<O>> => {
  const { control } = useFormContext<ComboboxFields<O>>();
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
          value={value as O[]}
          id={id}
          multiselect
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
          clearButtonAriaLabel={t('common:editor.combobox.clearButtonAriaLabel')}
          selectedItemRemoveButtonAriaLabel={t('common:editor.combobox.selectedItemRemoveButtonAriaLabel')}
        />
      )}
    />
  );
};

export default Combobox;
