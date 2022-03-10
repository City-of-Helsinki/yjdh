import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { useFormContext, Controller, RegisterOptions, NestedValue } from 'react-hook-form';
import { Select as HdsSelect } from 'hds-react';
import Id from 'shared/types/id';
import { OptionType } from 'tet-shared/types/classification';

type LanguagesType = Pick<TetPosting, 'languages'>;

type DropdownFields<O extends OptionType> = {
  languages: NestedValue<O[]>;
};

type Props<O extends OptionType> = {
  id: Id<DropdownFields<O>>;
  options: O[];
  initialValue: O[];
  label: string;
  registerOptions: RegisterOptions<DropdownFields<O>>;
};

const Dropdown = <O extends OptionType>({
  id,
  options,
  label,
  registerOptions,
}: Props<O>): React.ReactElement<DropdownFields<O>> => {
  const { control } = useFormContext<TetPosting>();

  return (
    <Controller
      name={id}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <HdsSelect<O>
          multiselect
          required
          value={value as O[]}
          options={options}
          label={label}
          optionLabelField="label"
          onChange={(val: OptionType[] | null) => {
            console.log(`onChange got ${JSON.stringify(val)}`);
            // onChange(val == null ? val : val.map(v => v.value))
            onChange(val);
          }}
          error={error ? error.message : ''}
          clearButtonAriaLabel=""
          selectedItemRemoveButtonAriaLabel=""
        />
      )}
      control={control}
    ></Controller>
  );
};

export default Dropdown;
