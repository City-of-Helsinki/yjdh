import { TextInput as HdsTextInput } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useApplicationForm from 'kesaseteli/employer/hooks/application/useApplicationForm';
// eslint-disable-next-line you-dont-need-lodash-underscore/get
import get from 'lodash/get';
import React from 'react';
import { RegisterOptions, UseFormRegister } from 'react-hook-form';
import Application from 'shared/types/employer-application';

import { $TextInput } from './TextInput.sc';
import { getLastValue } from 'shared/utils/array.utils';

type InputProps = {
  validation: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
};

const TextInput = ({
  id,
  validation,
  ...rest
}: InputProps): ReturnType<typeof HdsTextInput> => {
  const {
    translateLabel,
    translateError,
    register,
    formState: { errors },
  } = useApplicationForm();
  const { application, isLoading } = useApplicationApi();

  const defaultValue = String(get(application, id)) ?? '';
  const hasError = Boolean(get(errors, `${id}.type`));
  const name = getLastValue(id.split('.')) as string;

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
      errorText={hasError ? translateError(name) : undefined}
      label={translateLabel(name)}
    />
  );
};

TextInput.defaultProps = {
  path: undefined,
}

export default TextInput;
