import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import { CalculationFormProps } from 'benefit/handler/types/application';
import { ErrorData } from 'benefit/handler/types/common';
import { CALCULATION_EMPLOYMENT_KEYS } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import {
  convertToUIDateFormat,
  diffMonths,
  parseDate,
} from 'shared/utils/date.utils';

import { getValidationSchema } from './utils/validation';

type ExtendedComponentProps = {
  formik: FormikProps<CalculationFormProps>;
  fields: {
    [key in CALCULATION_EMPLOYMENT_KEYS]: Field<CALCULATION_EMPLOYMENT_KEYS>;
  };
  grantedPeriod: number;
  calculationsErrors: ErrorData | undefined | null;
};

const useEmploymentAppliedMoreView = (
  application: Application
): ExtendedComponentProps => {
  const { t } = useTranslation();

  const { onCalculateEmployment, calculationsErrors } =
    useHandlerReviewActions(application);

  const formik = useFormik<CalculationFormProps>({
    initialValues: {
      [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: convertToUIDateFormat(
        application?.calculation?.startDate
      ),
      [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: convertToUIDateFormat(
        application?.calculation?.endDate
      ),
    },
    validationSchema: getValidationSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: onCalculateEmployment,
  });
  const { setFieldValue, values } = formik;

  const { startDate, endDate } = values;

  const grantedPeriod = React.useMemo(
    () => diffMonths(parseDate(endDate), parseDate(startDate)),
    [endDate, startDate]
  );

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const pairs = Object.values(CALCULATION_EMPLOYMENT_KEYS).map<
      [CALCULATION_EMPLOYMENT_KEYS, Field<CALCULATION_EMPLOYMENT_KEYS>]
    >((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`common:calculators.fields.${fieldName}.label`),
        placeholder: t(`common:calculators.fields.${fieldName}.placeholder`),
      },
    ]);

    return fromPairs<Field<CALCULATION_EMPLOYMENT_KEYS>>(pairs) as Record<
      CALCULATION_EMPLOYMENT_KEYS,
      Field<CALCULATION_EMPLOYMENT_KEYS>
    >;
  }, [t]);

  useEffect(() => {
    if (grantedPeriod < 0) {
      void setFieldValue(fields.endDate.name, startDate);
    }
  }, [grantedPeriod, startDate, fields.endDate.name, setFieldValue]);

  return {
    formik,
    fields,
    grantedPeriod,
    calculationsErrors,
  };
};

export { useEmploymentAppliedMoreView };
