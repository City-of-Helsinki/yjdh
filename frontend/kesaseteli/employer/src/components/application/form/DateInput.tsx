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

  const {
    defaultLabel,
    getValue,
    getError,
    getErrorText,
    setError,
    clearErrors,
    setValue,
    clearValue,
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
      setError({
        type: errorType,
        message: `${t(`common:application.form.errors.${errorType}`)}. ${t(
          `common:application.form.helpers.date`
        )}`,
      });
    }
  }, [errorType, errorMessage, setError, t]);

  // TODO: This can be removed after backend supports invalid values in draft save
  const handleChange = React.useCallback(
    (dateString?: string) => {
      const uiDate = convertToUIDateFormat(dateString);
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
    <DateInputBase<ApplicationFormData>
      id={id}
      registerOptions={{ ...validation, setValueAs: convertDateForBackend }}
      initialValue={date}
      onChange={handleChange}
      errorText={getErrorText()}
      label={defaultLabel}
      {...$gridCellProps}
    />
  );
};

export default DateInput;
