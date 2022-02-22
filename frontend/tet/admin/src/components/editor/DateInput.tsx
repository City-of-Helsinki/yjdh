import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { DateInput as HdsDateInput } from 'hds-react';
import Id from 'shared/types/id';

type Props = {
  id: Id<TetPosting>;
  label: string;
  registerOptions?: RegisterOptions;
  required: boolean;
};

const DateInput: React.FC<Props> = ({ id, label, registerOptions, required = false }) => {
  const { control } = useFormContext<TetPosting>();
  console.log('date_rules', registerOptions);
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsDateInput
          disableConfirmation
          id={id}
          label={label}
          onChange={onChange}
          value={value ? String(value) : ''}
          required={required}
          invalid={invalid}
          language="fi"
          errorText={error ? error.message : ''}
        />
      )}
      control={control}
      rules={registerOptions}
    ></Controller>
  );
};

export default DateInput;
