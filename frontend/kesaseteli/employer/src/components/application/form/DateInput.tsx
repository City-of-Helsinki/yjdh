import { DateInput as HdsDateInput } from 'hds-react';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import DateInputBase from 'shared/components/forms/inputs/DateInput';
import { GridCellProps } from 'shared/components/forms/section/FormSection.sc';
import ApplicationFormData from 'shared/types/application-form-data';
import {
  convertToBackendDateFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';

type Props = {
  validation: RegisterOptions<ApplicationFormData>;
  id: ApplicationFieldPath;
} & GridCellProps;

const convertDateForBackend = (dateString: string): string | undefined => {
  const result = convertToBackendDateFormat(dateString);
  return isEmpty(result) || dateString.length < 8 ? undefined : result;
};

const DateInput = ({
  id,
  validation,
  ...$gridCellProps
}: Props): ReturnType<typeof HdsDateInput> => {
  const { t } = useTranslation();

  const {
    defaultLabel,
    getValue,
    setValue,
    getError,
    getErrorText,
    setError,
    clearErrors,
  } = useApplicationFormField<string>(id);

  const date = convertToUIDateFormat(getValue());

  const errorType = getError()?.type;
  const errorMessage = getError()?.message;

  React.useEffect(() => {
    if (
      errorType &&
      ['pattern', 'required'].includes(errorType) &&
      !errorMessage
    ) {
      const errorTypeMessage = t(`common:application.form.errors.${errorType}`);
      setError({
        type: errorType,
        message: `${errorTypeMessage}. ${t(
          'common:application.form.helpers.date'
        )}`,
      });
    }
  }, [errorType, errorMessage, setError, t]);

  return (
    <DateInputBase<ApplicationFormData>
      id={id}
      registerOptions={{ ...validation, setValueAs: convertDateForBackend }}
      initialValue={date}
      errorText={getErrorText()}
      label={defaultLabel}
      onChange={(value) => {
        // FIXME: Since the react-hook-forms onBlur is not called when a datepicker is used,
        // the clear errors function needs to be called with a value setter.
        // Otherwise the error message won't be cleared and
        // the value remains invalid after the date has been picked.
        clearErrors();
        setValue(value);
      }}
      {...$gridCellProps}
    />
  );
};

export default DateInput;
