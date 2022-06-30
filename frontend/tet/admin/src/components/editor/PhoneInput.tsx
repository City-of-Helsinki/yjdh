import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { PhoneInput as HdsPhoneInput } from 'hds-react';
import Id from 'shared/types/id';

type PhoneType = Pick<TetPosting, 'contact_phone'>;

type Props = {
  id: Id<PhoneType>;
  label: string;
  placeholder: string;
  registerOptions: RegisterOptions;
  testId?: string;
};

const PhoneInput: React.FC<Props> = ({ id, label, placeholder, registerOptions, testId }) => {
  const { control } = useFormContext<PhoneType>();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsPhoneInput
          id={id}
          data-testid={testId}
          label={label}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          required={Boolean(registerOptions.required)}
          invalid={invalid}
          errorText={error && error.message ? error.message : ''}
        />
      )}
      control={control}
      rules={registerOptions}
    />
  );
};

export default PhoneInput;
