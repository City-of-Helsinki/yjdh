import { TextInput as HdsTextInput, TextInputProps } from 'hds-react';
import { getApplicationFormContext } from 'kesaseteli/employer/components/form/ApplicationForm';
import Application from 'kesaseteli/employer/types/application';
import React from 'react';
import { FieldError, RegisterOptions } from 'react-hook-form';

type InputProps = {
  validation: RegisterOptions<Application>;
  id: keyof Application;
};

const TextInput = ({
  id,
  validation,
  ...rest
}: InputProps & TextInputProps): ReturnType<typeof HdsTextInput> => {
  const {
    application,
    register,
    formState: { errors },
    translate,
    translateError,
    isLoading,
  } = React.useContext(getApplicationFormContext());

  const defaultValue = application?.[id] ? String(application[id]) : '';
  const hasError = Boolean((errors[id] as FieldError)?.type);

  return (
    <HdsTextInput
      {...rest}
      {...register(id, validation)}
      id={id}
      data-testid={id}
      name={id}
      disabled={isLoading}
      required={Boolean(validation.required)}
      max={validation.maxLength ? String(validation.maxLength) : undefined}
      defaultValue={defaultValue}
      errorText={hasError ? translateError(id) : undefined}
      label={translate(id)}
    />
  );
};

export default TextInput;
