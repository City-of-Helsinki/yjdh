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
import InputMask from 'react-input-mask';
import TextInputBase from 'shared/components/forms/inputs/TextInput';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import ApplicationFormData from 'shared/types/application-form-data';

export type IbanInputProps = {
  id: ApplicationFieldPath;
} & GridCellProps;

const IbanInput: React.FC<GridCellProps> = ({ ...$gridCellProps }) => {
  const { t } = useTranslation();

  const { getValue } = useApplicationFormField<string>(
    'bank_account_number'
  );

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [cursor] = React.useState<number | null>(null);

  React.useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.setSelectionRange(cursor, cursor);
    }
  }, [inputRef, cursor]);

  const validateBankAccount = (value: string): boolean => {
    const { errorCodes, valid } = validateIBAN(electronicFormatIBAN(value));
    if (!valid) {
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
    <InputMask
      mask="aa** **** **** **** **** **** **** **** **"
      maskChar={null}
      value={getValue()}
      beforeMaskedValueChange={(newState) => {
        // eslint-disable-next-line no-param-reassign
        newState.value = friendlyFormatIBAN(newState.value).trim();
        return newState;
      }}
    >
      {() => (
        <TextInputBase<ApplicationFormData>
          registerOptions={{
            required: true,
            maxLength: 34,
            validate: validateBankAccount,
            setValueAs: electronicFormatIBAN,
          }}
          id="bank_account_number"
          placeholder={t('common:application.form.helpers.bank_account')}
          errorText={errorText}
          label={t(`common:application.form.inputs.bank_account_number`)}
          {...$gridCellProps}
        />
      )}
    </InputMask>
  );
};

export default IbanInput;
