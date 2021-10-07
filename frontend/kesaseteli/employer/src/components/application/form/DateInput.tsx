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
    fieldName,
    getValue,
    getError,
    setError,
    clearErrors,
    setValue,
    clearValue,
  } = useApplicationFormField<string>(id);

  const date = convertToUIDateFormat(getValue());

  const validate = React.useCallback(
    (value) => isValidDate(parseDate(value)),
    []
  );

  const errorType = getError()?.type;
  const errorText = React.useMemo((): string | undefined => {
    if (!errorType) {
      return undefined;
    }
    if (['pattern', 'required'].includes(errorType)) {
      return `${t(`common:application.form.errors.${errorType}`)}. ${t(
        `common:application.form.helpers.date`
      )}`;
    }
    return t(`common:application.form.errors.${errorType}`);
  }, [t, errorType]);

  // TODO: This can be removed after backend supports invalid values in draft save
  const handleChange = React.useCallback(
    (dateString: string) => {
      const uiDate = convertToUIDateFormat(dateString);
      if (isEmpty(uiDate)) {
        setError('pattern');
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
        value={date}
        language={locale}
        // for some reason date picker causes error "Cannot read property 'createEvent' of null" in tests. It's not needed for tests so it's disabled for them.
        disableDatePicker={process.env.NODE_ENV === 'test'}
        onChange={handleChange}
        errorText={errorText}
        label={t(`common:application.form.inputs.${fieldName}`)}
      />
    </$GridCell>
  );
};

export default DateInput;
