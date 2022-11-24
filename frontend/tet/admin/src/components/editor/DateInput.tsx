import { DateInput as HdsDateInput } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Controller, RegisterOptions, useFormContext } from 'react-hook-form';
import { Language } from 'shared/i18n/i18n';
import Id from 'shared/types/id';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  id: Id<TetPosting>;
  label: string;
  registerOptions?: RegisterOptions;
  required: boolean;
  minDate?: Date;
  helperText?: string;
  testId?: string;
};

const DateInput: React.FC<Props> = ({ id, label, registerOptions, required = false, minDate, helperText, testId }) => {
  const { control } = useFormContext<TetPosting>();
  const { i18n } = useTranslation();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsDateInput
          disableConfirmation
          id={id}
          data-testid={testId}
          label={label}
          onChange={onChange}
          value={value ? String(value) : ''}
          required={required}
          invalid={invalid}
          language={i18n.language as Language}
          errorText={error ? error.message : ''}
          minDate={minDate}
          helperText={helperText}
        />
      )}
      control={control}
      rules={registerOptions}
    />
  );
};

DateInput.defaultProps = {
  testId: undefined,
  registerOptions: {},
  minDate: undefined,
  helperText: undefined,
};

export default DateInput;
