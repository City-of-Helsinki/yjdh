import { TextInput as HdsTextInput, TextInputProps } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
import React from 'react';
import { FieldError, RegisterOptions } from 'react-hook-form';
import Application from 'shared/types/employer-application';

import { $TextInput } from './TextInput.sc';

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
    translateLabel,
    translateError,
    register,
    formState: { errors },
  } = useApplicationForm();
  const { application, isLoading } = useApplicationApi();

  const defaultValue = application?.[id] ? String(application[id]) : '';
  const hasError = Boolean((errors?.[id] as FieldError)?.type);

  return (
    <$TextInput
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
      label={translateLabel(id)}
    />
  );
};

export default TextInput;
