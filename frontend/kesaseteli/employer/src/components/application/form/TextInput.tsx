import {
  NumberInput as HdsNumberInput,
  TextArea as HdsTextArea,
  TextInput as HdsTextInput,
} from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions, UseFormRegister } from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/application-form-data';

import { $TextInput, $TextInputProps } from './TextInput.sc';

const getComponentType = (
  type: TextInputProps['type']
): typeof HdsTextInput | typeof HdsNumberInput | typeof HdsTextArea => {
  switch (type) {
    case 'number':
    case 'decimal':
      return HdsNumberInput;

    case 'textArea':
      return HdsTextArea;

    case 'text':
    default:
      return HdsTextInput;
  }
};

export type TextInputProps = {
  validation?: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
  type?: $TextInputProps['$type'];
  placeholder?: string;
  helperFormat?: string;
} & GridCellProps;

const TextInput: React.FC<TextInputProps> = ({
  id,
  validation = {},
  type = 'text',
  helperFormat,
  placeholder,
  ...$gridCellProps
}) => {
  const { t } = useTranslation();

  const { register, getValue, getError, fieldName, getErrorText, hasError } =
    useApplicationFormField<string>(id);

  const errorText = React.useMemo((): string | undefined => {
    const errorType = getError()?.type;
    const text = getErrorText();
    if (!text || !errorType) {
      return undefined;
    }
    const helperText = helperFormat
      ? `${t('common:application.form.helpers.format')}: ${helperFormat}`
      : undefined;
    if (['pattern', 'required'].includes(errorType) && helperText) {
      return `${text}. ${helperText}`;
    }
    return text;
  }, [t, getError, getErrorText, helperFormat]);

  // TODO: This can be removed after backend supports invalid values in draft save
  const setValueForBackend = React.useCallback(
    (newValue: string) =>
      // getError does not always update: https://github.com/react-hook-form/react-hook-form/issues/2893
      // if value hasnt changed (getValue is same as new value), then error is present and invalid value is changed to undefined
      // to prevent backend to fail
      getError() && getValue() === newValue ? undefined : newValue,
    [getError, getValue]
  );

  const preventScrolling = React.useCallback(
    (event: React.WheelEvent<HTMLInputElement>) => event.currentTarget.blur(),
    []
  );

  return (
    <$GridCell {...$gridCellProps}>
      <$TextInput
        as={getComponentType(type)}
        {...register(id, { ...validation, setValueAs: setValueForBackend })}
        $type={type}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        placeholder={placeholder}
        required={Boolean(validation.required)}
        max={validation.maxLength ? String(validation.maxLength) : undefined}
        defaultValue={getValue()}
        onWheel={preventScrolling}
        errorText={errorText}
        label={t(`common:application.form.inputs.${fieldName}`)}
        invalid={hasError()}
        aria-invalid={hasError()}
      />
    </$GridCell>
  );
};

export default TextInput;
