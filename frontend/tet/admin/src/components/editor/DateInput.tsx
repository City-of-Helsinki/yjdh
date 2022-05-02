import React from 'react';
import TetPosting from 'tet-shared/types/tetposting';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { DateInput as HdsDateInput } from 'hds-react';
import Id from 'shared/types/id';
import { useTranslation } from 'next-i18next';
import { Language } from 'shared/i18n/i18n';

type Props = {
  id: Id<TetPosting>;
  testId?: string;
  label: string;
  registerOptions?: RegisterOptions;
  required: boolean;
  minDate?: Date;
};

const DateInput: React.FC<Props> = ({ id, label, registerOptions, required = false, minDate, testId }) => {
  const { control } = useFormContext<TetPosting>();
  const { i18n } = useTranslation();
  return (
    <Controller
      name={id}
      render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
        <HdsDateInput
          disableConfirmation
          data-testid={testId}
          id={id}
          label={label}
          onChange={onChange}
          value={value ? String(value) : ''}
          required={required}
          invalid={invalid}
          language={i18n.language as Language}
          errorText={error ? error.message : ''}
          minDate={minDate}
        />
      )}
      control={control}
      rules={registerOptions}
    ></Controller>
  );
};

export default DateInput;
