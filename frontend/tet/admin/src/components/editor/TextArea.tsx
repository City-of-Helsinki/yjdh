import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextArea as HdsTextArea } from 'hds-react';
import Id from 'shared/types/id';

type Props = {
  id: Id<TetPosting>;
  label: string;
  registerOptions: RegisterOptions;
  required: boolean;
};

const TextArea: React.FC<Props> = ({ id, label, registerOptions, required = false }) => {
  const { control } = useFormContext<TetPosting>();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsTextArea
          id={id}
          label={label}
          onChange={onChange}
          value={value ? String(value) : ''}
          required={required}
          invalid={invalid}
          errorText={error ? error.message : ''}
        />
      )}
      control={control}
      rules={registerOptions}
    ></Controller>
  );
};

export default TextArea;
