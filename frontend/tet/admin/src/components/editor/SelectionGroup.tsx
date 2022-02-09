import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { Controller, useFormContext } from 'react-hook-form';
import { SelectionGroup as HdsSelectionGroup, Checkbox } from 'hds-react';
import Id from 'shared/types/id';
import { OptionType } from 'tet/admin/types/classification';

// TODO add minusStepButtonAriaLabel and plusStepButtonAriaLabel
type Props = {
  fieldId: Id<TetPosting>;
  label: string;
  options: OptionType[];
  required: boolean;
};

const SelectionGroup: React.FC<Props> = ({ fieldId, label, options, required }) => {
  const { control, setValue, getValues, clearErrors } = useFormContext<TetPosting>();
  const checkboxChangeHandler = (optionId: string) => {
    const values = getValues(fieldId);
    if (Array.isArray(values)) {
      let list = [...values];
      const index = list.indexOf(optionId);
      if (index === -1) {
        list = list.concat(optionId);
        if (required) {
          clearErrors(fieldId);
        }
      } else {
        list.splice(index, 1);
      }
      setValue(fieldId, list);
    }
  };

  return (
    <Controller
      name={fieldId}
      control={control}
      render={({ field: { ref, value, ...field }, fieldState: { error, invalid, ...fieldState } }) => (
        <HdsSelectionGroup label={label} errorText={error && error.message ? error.message : ''} required={required}>
          {options.map((option) => (
            <Checkbox
              id={option.value}
              label={option.label}
              checked={value && Array.isArray(value) ? value.includes(option.value) : false}
              onChange={() => checkboxChangeHandler(option.value)}
            />
          ))}
        </HdsSelectionGroup>
      )}
    />
  );
};

export default SelectionGroup;
