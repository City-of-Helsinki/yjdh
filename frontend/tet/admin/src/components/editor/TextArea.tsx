import { TextArea as HdsTextArea } from 'hds-react';
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
  testId?: string;
  label: string;
  registerOptions: RegisterOptions;
  required: boolean;
};

const TextArea: React.FC<Props> = ({ id, label, registerOptions, required = false, testId }) => {
  const { control } = useFormContext<TetPosting>();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsTextArea
          data-testid={testId}
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
    />
  );
};

export default TextArea;
