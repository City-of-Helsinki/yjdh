import { CALCULATION_EMPLOYMENT_KEYS } from 'benefit/handler/constants';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import {
  Application,
  CalculationCommon,
} from 'benefit/handler/types/application';
import { getErrorText } from 'benefit/handler/utils/forms';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'shared/components/forms/fields/types';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import {
  convertToUIDateFormat,
  diffMonths,
  parseDate,
} from 'shared/utils/date.utils';
import { focusAndScroll } from 'shared/utils/dom.utils';
import { DefaultTheme, useTheme } from 'styled-components';

import { getValidationSchema } from './utils/validation';

type ExtendedComponentProps = {
  t: TFunction;
  formik: FormikProps<CalculationCommon>;
  translationsBase: string;
  theme: DefaultTheme;
  fields: {
    [key in CALCULATION_EMPLOYMENT_KEYS]: Field<CALCULATION_EMPLOYMENT_KEYS>;
  };
  language: Language;
  grantedPeriod: number;
  handleSubmit: () => void;
  getErrorMessage: (fieldName: string) => string | undefined;
};

const useEmploymentAppliedMoreView = (
  application: Application
): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const translationsBase = 'common:calculators.employment';
  const { t } = useTranslation();

  const { onCalculateEmployment } = useHandlerReviewActions(application);

  const formik = useFormik({
    initialValues: {
      [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: convertToUIDateFormat(
        application?.calculation?.startDate
      ),
      [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: convertToUIDateFormat(
        application?.calculation?.endDate
      ),
    },
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: onCalculateEmployment,
  });
  const { errors, touched, setFieldValue, values } = formik;
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { startDate, endDate } = values;

  const grantedPeriod = React.useMemo(
    () => diffMonths(parseDate(endDate) || 0, parseDate(startDate) || 0),
    [endDate, startDate]
  );

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const pairs = Object.values(CALCULATION_EMPLOYMENT_KEYS).map<
      [CALCULATION_EMPLOYMENT_KEYS, Field<CALCULATION_EMPLOYMENT_KEYS>]
    >((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`${translationsBase}.fields.${fieldName}.label`),
        placeholder: t(`${translationsBase}.fields.${fieldName}.placeholder`),
      },
    ]);

    return fromPairs<Field<CALCULATION_EMPLOYMENT_KEYS>>(pairs) as Record<
      CALCULATION_EMPLOYMENT_KEYS,
      Field<CALCULATION_EMPLOYMENT_KEYS>
    >;
  }, [t, translationsBase]);

  useEffect(() => {
    if (grantedPeriod < 0) {
      void setFieldValue(fields.endDate.name, startDate);
    }
  }, [grantedPeriod, startDate, fields.endDate.name, setFieldValue]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  const handleSubmit = (): void => {
    setIsSubmitted(true);
    void formik.validateForm().then((errs) => {
      const fieldName = Object.keys(errs)[0];
      if (!fieldName) {
        return formik.submitForm();
      }
      return focusAndScroll(fieldName);
    });
  };

  return {
    t,
    formik,
    translationsBase,
    theme,
    fields,
    language,
    grantedPeriod,
    getErrorMessage,
    handleSubmit,
  };
};

export { useEmploymentAppliedMoreView };
