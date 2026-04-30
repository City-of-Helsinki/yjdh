import { Select } from 'hds-react';
import React from 'react';
import { FieldValues, useController, useFormContext } from 'react-hook-form';
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

const haveSameOptions = (
  previousOptions: HdsOption[],
  nextOptions: HdsOption[]
): boolean =>
  previousOptions.length === nextOptions.length &&
  previousOptions.every(
    (option, index) =>
      option.label === nextOptions[index]?.label &&
      option.value === nextOptions[index]?.value
  );

type Props<T extends FieldValues, O extends Option> = InputProps<T, O[]> &
  GridCellProps & {
    type?: 'select' | 'combobox';
    multiselect?: boolean;
    optionLabelField: keyof O;
    options: O[];
  };

const MultiSelectDropdown = <T extends FieldValues, O extends Option>({
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
  const {
    field: { value, onChange: controllerOnChange, ...field },
  } = useController<T>({
    name: id,
    control,
    rules: registerOptions,
    defaultValue: (initialValue ?? []) as T[typeof id],
  });
  const required = Boolean(registerOptions.required);
  const inputId = String(id);
  const getOptionValue = React.useCallback(
    (option: O): string => String(option[optionLabelField]),
    [optionLabelField]
  );
  const toHdsOption = React.useCallback((option: O): HdsOption => {
    const optionValue = getOptionValue(option);
    return {
      label: optionValue,
      value: optionValue,
    };
  }, [getOptionValue]);

  const hdsOptions = React.useMemo(
    () => options.map((option) => toHdsOption(option)),
    [options, toHdsOption]
  );
  const selectedValues = React.useMemo(
    () =>
      (((value as O[] | undefined) ?? initialValue ?? []).map((option) =>
        toHdsOption(option)
      )),
    [initialValue, toHdsOption, value]
  );
  // Mirror HDS's in-progress multi-select state locally until the menu closes.
  const [draftSelectedValues, setDraftSelectedValues] =
    React.useState<HdsOption[]>(selectedValues);
  const draftSelectedValuesRef = React.useRef<HdsOption[]>(selectedValues);

  React.useEffect(() => {
    setDraftSelectedValues((previousOptions) =>
      haveSameOptions(previousOptions, selectedValues)
        ? previousOptions
        : selectedValues
    );
    draftSelectedValuesRef.current = selectedValues;
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

  const toDomainValues = React.useCallback(
    (selectedOptions: HdsOption[]): O[] =>
      selectedOptions
        .map((selectedOption) =>
          options.find(
            (option) => getOptionValue(option) === selectedOption.value
          )
        )
        .filter((option): option is O => Boolean(option)),
      [getOptionValue, options]
  );

  return (
    <$GridCell {...$gridCellProps}>
      <$DropdownWrapper errorText={errorText}>
        <Select
          {...field}
          {...sharedProps}
          value={draftSelectedValues}
          onChange={(selectedOptions: HdsOption[]) => {
            const nextValue = toDomainValues(selectedOptions);
            draftSelectedValuesRef.current = selectedOptions;
            setDraftSelectedValues(selectedOptions);
            controllerOnChange(nextValue);
            onChange?.(nextValue);
          }}
          onClose={() => {
            const nextValue = toDomainValues(draftSelectedValuesRef.current);
            controllerOnChange(nextValue);
            onChange?.(nextValue);
          }}
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
