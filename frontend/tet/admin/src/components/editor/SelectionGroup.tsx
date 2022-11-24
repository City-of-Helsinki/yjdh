import { Checkbox, SelectionGroup as HdsSelectionGroup } from 'hds-react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Id from 'shared/types/id';
import { OptionType } from 'tet-shared/types/classification';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  fieldId: Id<Pick<TetPosting, 'keywords_working_methods' | 'keywords_attributes'>>;
  testId?: string;
  label: string;
  options: OptionType[];
  required: boolean;
  rules?: () => true | string;
};

const SelectionGroup: React.FC<Props> = ({ fieldId, label, options, required, rules, testId }) => {
  const { control, setValue, getValues, clearErrors } = useFormContext<TetPosting>();
  const checkboxChangeHandler = (option: OptionType): void => {
    const values = getValues(fieldId);
    if (Array.isArray(values)) {
      const list: OptionType[] = [...values];
      const index = list.findIndex((item) => item.value === option.value);
      if (index === -1) {
        list.push(option);
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
      render={({ field: { value }, fieldState: { error } }) => (
        <HdsSelectionGroup
          data-testid={testId}
          label={label}
          errorText={error && error.message ? error.message : ''}
          required={required}
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              id={option.value}
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
