import { TextInput as HdsTextInput } from 'hds-react';
import React from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import Id from 'shared/types/id';
import TetPosting from 'tet-shared/types/tetposting';

// Known issue with react-hook-form library, errors out with:
// Type of property 'prototype' circularly references itself in mapped type '{ [K in keyof Blob]-?: PathImpl<K & string, Blob[K]>; }'.
// More at: https://github.com/orgs/react-hook-form/discussions/7764
type Props = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
    />
  );
};

export default TextInput;
