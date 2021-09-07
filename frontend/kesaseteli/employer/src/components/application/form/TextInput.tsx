import { TextInput as HdsTextInput } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
// eslint-disable-next-line you-dont-need-lodash-underscore/get
import get from 'lodash/get';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions, useFormContext,UseFormRegister } from 'react-hook-form';
import Application from 'shared/types/employer-application';
import { getLastValue } from 'shared/utils/array.utils';

import { $TextInput } from './TextInput.sc';

type InputProps = {
  validation: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
};

const TextInput = ({
  id,
  validation,
  ...rest
}: InputProps): ReturnType<typeof HdsTextInput> => {

  const {t} = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<Application>();
  const { application, isLoading } = useApplicationApi();


  const defaultValue = String(get(application, id)) ?? '';
  const hasError = Boolean(get(errors, `${id}.type`));
  const name = getLastValue((id as string).split('.')) ?? '';

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
      errorText={hasError ? t(`common:application.form.errors.${name}`) : undefined}
      label={t(`common:application.form.inputs.${name}`)}
    />
  );
};

export default TextInput;
