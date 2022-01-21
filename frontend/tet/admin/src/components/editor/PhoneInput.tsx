import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import { useFormContext } from 'react-hook-form';
import { PhoneInput as HdsPhoneInput } from 'hds-react';
import Id from 'shared/types/id';
import { RegisterOptions } from 'react-hook-form';

// TODO add minusStepButtonAriaLabel and plusStepButtonAriaLabel
type Props = {
  id: Id<TetPosting>;
  initialValue: string;
  label: string;
  placeholder: string;
  registerOptions: RegisterOptions;
};

const PhoneInput: React.FC<Props> = ({ id, initialValue, label, placeholder, registerOptions }) => {
  const { register } = useFormContext<TetPosting>();
  return (
    <HdsPhoneInput
      {...(register(id), { registerOptions })}
      id={id}
      label={label}
      defaultValue={initialValue}
      placeholder={placeholder}
      required={Boolean(registerOptions.required)}
    />
  );
};

export default PhoneInput;
