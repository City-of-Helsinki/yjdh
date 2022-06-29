import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { Controller, useFormContext } from 'react-hook-form';
import { SelectionGroup as HdsSelectionGroup, Checkbox } from 'hds-react';
import Id from 'shared/types/id';
import { OptionType } from 'tet-shared/types/classification';

type Props = {
  fieldId: Id<Pick<TetPosting, 'keywords_working_methods' | 'keywords_attributes'>>;
  label: string;
  options: OptionType[];
  required: boolean;
  rules?: () => true | string;
};

const SelectionGroup: React.FC<Props> = ({ fieldId, label, options, required, rules }) => {
  const { control, setValue, getValues, clearErrors } = useFormContext<TetPosting>();
  const checkboxChangeHandler = (option: OptionType) => {
    const values = getValues(fieldId);
    if (Array.isArray(values)) {
      let list: OptionType[] = [...values];
      const index = list.findIndex((item) => item.value === option.value);
      if (index === -1) {
        list = list.concat(option);
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
      rules={{
        validate: rules,
      }}
      render={({ field: { ref, value, ...field }, fieldState: { error, invalid, ...fieldState } }) => (
        <HdsSelectionGroup label={label} errorText={error && error.message ? error.message : ''} required={required}>
          {options.map((option) => (
            <Checkbox
              id={option.value}
              key={option.value}
              label={option.label}
              checked={value && Array.isArray(value) ? value.some((item) => item.value === option.value) : false}
              onChange={() => checkboxChangeHandler(option)}
            />
          ))}
        </HdsSelectionGroup>
      )}
    />
  );
};

export default SelectionGroup;
