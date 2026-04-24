import { Select } from 'hds-react';
import React from 'react';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import InputProps from 'shared/types/input-props';

import FieldErrorMessage from '../fields/fieldErrorMessage/FieldErrorMessage';
import { $DropdownWrapper } from './Dropdown.sc';

type Option = {
  name: string;
};

type HdsOption = {
  label: string;
  value: string;
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
  multiselect: _multiselect = true,
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
  const { control } = useFormContext<T>();
  const required = Boolean(registerOptions.required);
  const inputId = String(id);
  const getOptionValue = (option: O): string =>
    String(option[optionLabelField]);
  const toHdsOption = (option: O): HdsOption => {
    const value = getOptionValue(option);
    return {
      label: value,
      value,
    };
  };

  const hdsOptions: HdsOption[] = options.map(toHdsOption);
  const selectedValues = (initialValue ?? []).map(toHdsOption);
  // Mirror HDS's in-progress multi-select state locally until the menu closes.
  const [draftSelectedValues, setDraftSelectedValues] =
    React.useState<HdsOption[]>(selectedValues);

  React.useEffect(() => {
    setDraftSelectedValues(selectedValues);
  }, [selectedValues]);

  const sharedProps = {
    multiSelect: true as const,
    'data-testid': inputId,
    id: inputId,
    required,
    label,
    placeholder,
    options: hdsOptions,
    disabled,
    invalid: Boolean(errorText),
  };

  return (
    <$GridCell {...$gridCellProps}>
      <$DropdownWrapper errorText={errorText}>
        <Controller
          name={id}
          data-testid={inputId}
          control={control}
          rules={registerOptions}
          render={({
            field: { ref, onChange: controllerOnChange, ...field },
          }) => (
            <Select
              {...field}
              {...sharedProps}
              value={draftSelectedValues}
              onChange={(selectedOptions: HdsOption[]) => {
                setDraftSelectedValues(selectedOptions);
              }}
              onClose={() => {
                // Convert the draft HDS options back to domain objects and commit once the menu closes.
                const nextValue = draftSelectedValues
                  .map((selectedOption) =>
                    options.find(
                      (option) =>
                        getOptionValue(option) === selectedOption.value
                    )
                  )
                  .filter((option): option is O => Boolean(option));
                controllerOnChange(nextValue);
                onChange?.(nextValue);
              }}
            />
          )}
        />
        {errorText && (
          <FieldErrorMessage data-testid={`${inputId}-error`}>
            {errorText}
          </FieldErrorMessage>
        )}
      </$DropdownWrapper>
    </$GridCell>
  );
};

export default MultiSelectDropdown;
