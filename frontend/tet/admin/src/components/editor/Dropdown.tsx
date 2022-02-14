import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { Select as HdsSelect } from 'hds-react';
import Id from 'shared/types/id';

type OptionType = {
  value: string;
  label: string;
};

type Props = {
  id: Id<TetPosting>;
  options: OptionType[];
  initialValue: OptionType;
  label: string;
  registerOptions: RegisterOptions;
};

const Dropdown: React.FC<Props> = ({ id, options, initialValue, label, registerOptions }) => {
  const { control } = useFormContext<TetPosting>();

  return (
    <Controller
      name={id}
      render={({ field: { onChange } }) => (
        <HdsSelect
          options={options}
          label={label}
          optionLabelField="label"
          defaultValue={initialValue}
          onChange={(val: OptionType) => onChange(val.value)}
        />
      )}
      control={control}
      rules={registerOptions}
    ></Controller>
  );
};

export default Dropdown;
