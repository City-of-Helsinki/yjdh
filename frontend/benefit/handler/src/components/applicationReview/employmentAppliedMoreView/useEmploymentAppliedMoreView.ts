import { CALCULATION_EMPLOYMENT_KEYS } from 'benefit/handler/constants';
import {
  Application,
  CalculationCommon,
} from 'benefit/handler/types/application';
import { getErrorText } from 'benefit/handler/utils/forms';
import { FormikProps, useFormik } from 'formik';
import { fromPairs, noop } from 'lodash';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'shared/components/forms/fields/types';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import { formatDate, parseDate } from 'shared/utils/date.utils';
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
  getErrorMessage: (fieldName: string) => string | undefined;
  language: Language;
};

const useEmploymentAppliedMoreView = (
  application: Application
): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const translationsBase = 'common:calculators.employment';
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: {
      [CALCULATION_EMPLOYMENT_KEYS.START_DATE]: application?.calculation
        ?.startDate
        ? formatDate(parseDate(application?.calculation?.startDate))
        : '',
      [CALCULATION_EMPLOYMENT_KEYS.END_DATE]: application?.calculation?.endDate
        ? formatDate(parseDate(application?.calculation?.endDate))
        : '',
    },
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: noop,
  });
  const { values, errors, touched, setFieldValue } = formik;
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const pairs = Object.values(CALCULATION_EMPLOYMENT_KEYS).map<
      [CALCULATION_EMPLOYMENT_KEYS, Field<CALCULATION_EMPLOYMENT_KEYS>]
    >((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`${translationsBase}.fields.fieldName.label`),
        placeholder: t(`${translationsBase}.fields.fieldName.placeholder`),
      },
    ]);

    return fromPairs<Field<CALCULATION_EMPLOYMENT_KEYS>>(pairs) as Record<
      CALCULATION_EMPLOYMENT_KEYS,
      Field<CALCULATION_EMPLOYMENT_KEYS>
    >;
  }, [t, translationsBase]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  return {
    t,
    formik,
    translationsBase,
    theme,
    fields,
    getErrorMessage,
    language,
  };
};

export { useEmploymentAppliedMoreView };
