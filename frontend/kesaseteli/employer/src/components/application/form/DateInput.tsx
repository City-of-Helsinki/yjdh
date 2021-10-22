import { DateInput as HdsDateInput } from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import React from 'react';
import {
  RegisterOptions,
  useFormContext,
  UseFormRegister,
} from 'react-hook-form';
import {
  $GridCell,
  GridCellProps,
} from 'shared/components/forms/section/FormSection.sc';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application-form-data';
import {
  convertToBackendDateFormat,
  convertToUIDateFormat,
  isValidDate,
  parseDate,
} from 'shared/utils/date.utils';
import noop from 'lodash/noop';

import { $DateInput } from './DateInput.sc';

type Props = {
  validation: RegisterOptions<Application>;
  id: NonNullable<Parameters<UseFormRegister<Application>>[0]>;
} & GridCellProps;

// TODO: This can be removed after backend supports invalid values in draft save
const convertDateForBackend = (dateString: string): string | undefined => {
  const result = convertToBackendDateFormat(dateString);
  return isEmpty(result) ? undefined : result;
};

const DateInput = ({
  id,
  validation,
  ...$gridCellProps
}: Props): ReturnType<typeof HdsDateInput> => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { register } = useFormContext<Application>();
  const {
    defaultLabel,
    getValue,
    getError,
    getErrorText,
    setError,
    clearErrors,
    setValue,
    clearValue,
    hasError,
  } = useApplicationFormField<string>(id);

  const date = convertToUIDateFormat(getValue());

  const validate = React.useCallback(
    (value) => isValidDate(parseDate(value)),
    []
  );

  const errorType = getError()?.type;
  const errorMessage = getError()?.message;

  React.useEffect(() => {
    if (
      errorType &&
      ['pattern', 'required'].includes(errorType) &&
      !errorMessage
    ) {
      setError({
        type: errorType,
        message: `${t(`common:application.form.errors.${errorType}`)}. ${t(
          `common:application.form.helpers.date`
        )}`,
      });
    }
  }, [errorType, errorMessage, setError, t]);

  // TODO: This can be removed after backend supports invalid values in draft save
  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const uiDate = convertToUIDateFormat(event.target.value);
      if (isEmpty(uiDate)) {
        setError({ type: 'pattern' });
        clearValue();
      } else {
        clearErrors();
        setValue(uiDate);
      }
    },
    [setError, clearValue, setValue, clearErrors]
  );

  return (
    <$GridCell {...$gridCellProps}>
      <$DateInput
        {...register(id, {
          ...validation,
          validate,
          setValueAs: convertDateForBackend,
        })}
        key={id}
        id={id}
        data-testid={id}
        name={id}
        required={Boolean(validation.required)}
        initialMonth={new Date()}
        defaultValue={date}
        language={locale}
        onBlur={handleBlur}
        onChange={noop}
        errorText={getErrorText()}
        label={defaultLabel}
        invalid={hasError()}
        aria-invalid={hasError()}
      />
    </$GridCell>
  );
};

export default DateInput;
