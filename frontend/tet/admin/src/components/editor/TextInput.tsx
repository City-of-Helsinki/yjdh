import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { TextInput as HdsTextInput } from 'hds-react';
import Id from 'shared/types/id';

type Props = {
  id: Id<TetPosting>;
  label: string;
  placeholder: string;
  registerOptions: RegisterOptions;
  testId?: string;
  helperText?: string;
};

const TextInput: React.FC<Props> = ({ id, label, placeholder, registerOptions, helperText, testId }) => {
  const { control } = useFormContext<TetPosting>();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsTextInput
          id={id}
          data-testid={testId}
          label={label}
          placeholder={placeholder}
          onChange={onChange}
          value={value ? String(value) : ''}
          required={Boolean(registerOptions.required)}
          invalid={invalid}
          errorText={error ? error.message : ''}
          helperText={helperText}
        />
      )}
      control={control}
      rules={registerOptions}
    ></Controller>
  );
};

export default TextInput;
