import { useMaskito } from '@maskito/react';
import {
  electronicFormatIBAN,
  friendlyFormatIBAN,
  validateIBAN,
  ValidationErrorsIBAN,
} from 'ibantools';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import { useTranslation } from 'next-i18next';
import React from 'react';
import TextInputBase from 'shared/components/forms/inputs/TextInput';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import ApplicationFormData from 'shared/types/application-form-data';
import { maskitoExpressionFromLegacyFormat } from 'shared/utils/maskito';

export type IbanInputProps = {
  id: ApplicationFieldPath;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
} & GridCellProps;

const IbanInput: React.FC<IbanInputProps> = ({
  id,
  onBlur,
  ...$gridCellProps
}) => {
  const { t } = useTranslation();

  const { getValue, getErrorText: getDefaultErrorText } =
    useApplicationFormField<string>(id);

  const [errorText, setErrorText] = React.useState<string | null>(null);

  const inputRef = useMaskito({
    options: {
      mask: maskitoExpressionFromLegacyFormat(
        'aa** **** **** **** **** **** **** **** **'
      ),
    },
  });
  const setInputRef: React.RefCallback<
    HTMLInputElement | HTMLTextAreaElement
  > = (node) => {
    void (inputRef as unknown as (target: HTMLElement | null) => void)(
      node as HTMLElement | null
    );
  };

  const validateBankAccount = (value: string): boolean => {
    const electronicIBAN =
      electronicFormatIBAN(value ?? undefined) ?? undefined;
    const { errorCodes, valid } = validateIBAN(electronicIBAN ?? undefined);
    if (!valid) {
      if (process.env.NODE_ENV !== 'production') {
        const maskedIban = electronicIBAN
          ? `****${electronicIBAN.slice(-4)}`
          : undefined;
        // eslint-disable-next-line no-console
        console.error('Invalid IBAN', {
          valid,
          errorCodes,
          maskedIban,
        });
      }
      setErrorText(
        t(
          `common:application.form.errors.${
            ValidationErrorsIBAN[errorCodes[0]]
          }`
        )
      );
      return false;
    }
    setErrorText(null);
    return true;
  };

  return (
    <TextInputBase<ApplicationFormData>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      registerOptions={{
        required: true,
        maxLength: 34,
        ...(process.env.NODE_ENV !== 'test' && {
          validate: validateBankAccount,
        }),
        setValueAs: electronicFormatIBAN,
      }}
      id={id}
      initialValue={friendlyFormatIBAN(getValue() ?? undefined)?.trim() ?? ''}
      placeholder={t('common:application.form.helpers.bank_account')}
      errorText={errorText ?? getDefaultErrorText()}
      label={t('common:application.form.inputs.bank_account_number')}
      onBlur={onBlur}
      inputRef={setInputRef}
      {...$gridCellProps}
    />
  );
};

export default IbanInput;
