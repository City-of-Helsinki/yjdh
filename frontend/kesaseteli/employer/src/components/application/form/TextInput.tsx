import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import TextInputBase, {
  TextInputProps as TextInputBaseProps,
} from 'shared/components/forms/inputs/TextInput';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import ApplicationFormData from 'shared/types/application-form-data';

export type TextInputProps = {
  validation?: RegisterOptions<ApplicationFormData>;
  id: ApplicationFieldPath;
  type?: TextInputBaseProps<ApplicationFormData>['type'];
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

  const { getValue, getError, fieldName, getErrorText } =
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
  return (
    <TextInputBase<ApplicationFormData>
      registerOptions={{ ...validation, setValueAs: setValueForBackend }}
      type={type}
      id={id}
      placeholder={placeholder}
      initialValue={getValue()}
      errorText={errorText}
      label={t(`common:application.form.inputs.${fieldName}`)}
      {...$gridCellProps}
    />
  );
};

export default TextInput;
