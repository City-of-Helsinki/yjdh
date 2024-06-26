/**
 * TODO: YJDH-701, refactor to reduce code duplication, copied and modified from:
 *       frontend/kesaseteli/employer/src/components/application/form/TextInput.tsx
 */
import useApplicationWithoutSsnFormField from 'kesaseteli/handler/hooks/application/useApplicationWithoutSsnFormField';
import type {
  ApplicationWithoutSsnFieldPath,
  ApplicationWithoutSsnFormData,
} from 'kesaseteli/handler/types/application-without-ssn-types';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import TextInputBase, {
  TextInputProps as TextInputBaseProps,
} from 'shared/components/forms/inputs/TextInput';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import type AutoComplete from 'shared/types/auto-complete';

export type TextInputProps = {
  validation?: RegisterOptions<ApplicationWithoutSsnFormData>;
  id: ApplicationWithoutSsnFieldPath;
  type?: TextInputBaseProps<ApplicationWithoutSsnFormData>['type'];
  placeholder?: string;
  helperFormat?: string;
  onChange?: (value: string) => void;
  autoComplete?: AutoComplete;
} & GridCellProps;

const TextInput: React.FC<TextInputProps> = ({
  id,
  validation = {},
  type = 'text',
  helperFormat,
  placeholder,
  onChange,
  autoComplete,
  ...$gridCellProps
}) => {
  const { t } = useTranslation();

  const { getValue, getError, fieldName, getErrorText } =
    useApplicationWithoutSsnFormField<string>(id);

  const errorText = (): string | undefined => {
    const errorType = getError()?.type;
    const text = getErrorText();
    if (!text || !errorType) {
      return undefined;
    }
    const helperText = helperFormat
      ? `${t(
          'common:applicationWithoutSsn.form.helpers.format'
        )}: ${helperFormat}`
      : undefined;
    if (['pattern', 'required'].includes(errorType) && helperText) {
      return `${text}. ${helperText}`;
    }
    return text;
  };

  return (
    <TextInputBase<ApplicationWithoutSsnFormData>
      registerOptions={{ ...validation }}
      type={type}
      id={id}
      placeholder={placeholder}
      initialValue={getValue()}
      errorText={errorText()}
      label={t(`common:applicationWithoutSsn.form.inputs.${fieldName}`)}
      onChange={onChange}
      autoComplete={autoComplete}
      {...$gridCellProps}
    />
  );
};

export default TextInput;
