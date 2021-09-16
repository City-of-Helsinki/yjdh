import { NumberInput as HdsNumberInput, TextArea  as HdsTextAtea,TextInput as HdsTextInput } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  FieldError,
  get,
  RegisterOptions,
  useFormContext,
  UseFormRegister} from 'react-hook-form';
import { $GridCell,GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/employer-application';
import { getLastValue } from 'shared/utils/array.utils';
import { isEmpty } from 'shared/utils/string.utils';

import { $TextInput, $TextInputProps } from './TextInput.sc';

const getComponentType = (type: Props['type']):typeof HdsTextInput | typeof HdsNumberInput |  typeof HdsTextAtea => {
  switch(type) {
    case 'number':
    case 'decimal':
      return HdsNumberInput;

    case 'textArea':
      return HdsTextAtea;

    case 'text':
    default:
      return HdsTextInput;
  }
}

type Props = {
  validation?: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  type?: $TextInputProps['$type'],
} & GridCellProps;

const TextInput : React.FC<Props> = ({
  id,
  validation = {},
  type = 'text',
  ...gridCellProps
}) => {
  const { t } = useTranslation();
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext<Application>();
  const { isLoading } = useApplicationApi();

  const defaultValue = getValues(id) as string;
  const name = getLastValue((id as string).split('.')) ?? '';
  const errorType = get(errors, `${id}.type`) as FieldError['type'];
  const isError = Boolean(errorType);

  const errorText = React.useMemo((): string | undefined => {
    if (!isError) {
      return undefined;
    }
    const error = t(`common:application.form.errors.${errorType}`);
    const helperText = type === 'decimal' ? t(`common:application.form.helpers.decimal`) : undefined;
    if (errorType === 'pattern' && helperText) {
      return `${error}. ${helperText}`;
    }
    return error;
  },[t,errorType, isError, type]);

  const getValueForBackend = React.useCallback((value: string) => isEmpty(value) ? undefined : value, []);


  return (
    <$GridCell {...gridCellProps}>
      <$TextInput
        as={getComponentType(type)}
        {...register(id, {...validation, setValueAs: getValueForBackend})}
        $type={type}
        id={id}
        data-testid={id}
        name={id}
        disabled={isLoading}
        required={Boolean(validation.required)}
        max={validation.maxLength ? String(validation.maxLength) : undefined}
        defaultValue={defaultValue}
        errorText={errorText}
        label={t(`common:application.form.inputs.${name}`)}
      />
  </$GridCell>
  );
};

export default TextInput;
