import {
  CALCULATION_SALARY_KEYS,
  STATE_AID_MAX_PERCENTAGE_OPTIONS,
} from 'benefit/handler/constants';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import {
  Application,
  SalaryCalculation,
} from 'benefit/handler/types/application';
import { ErrorData } from 'benefit/handler/types/common';
import { getErrorText } from 'benefit/handler/utils/forms';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'shared/components/forms/fields/types';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';
import {
  convertToUIDateFormat,
  diffMonths,
  parseDate,
} from 'shared/utils/date.utils';
import { focusAndScroll } from 'shared/utils/dom.utils';
import { DefaultTheme, useTheme } from 'styled-components';
import { getValidationSchema } from '../employmentAppliedMoreView/utils/validation';

type ExtendedComponentProps = {
  t: TFunction;
  formik: FormikProps<SalaryCalculation>;
  translationsBase: string;
  theme: DefaultTheme;
  fields: {
    [key in CALCULATION_SALARY_KEYS]: Field<CALCULATION_SALARY_KEYS>;
  };
  language: Language;
  grantedPeriod: number;
  calculationsErrors: ErrorData | undefined | null;
  handleSubmit: () => void;
  getErrorMessage: (fieldName: string) => string | undefined;
  stateAidMaxPercentageOptions: OptionType[];
  getStateAidMaxPercentageSelectValue: () => OptionType | undefined;
};

const useSalaryBenefitCalculatorData = (
  application: Application
): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const translationsBase = 'common:calculators.salary';
  const { t } = useTranslation();

  const { calculateSalaryBenefit, calculationsErrors } =
    useHandlerReviewActions(application);

  const formik = useFormik({
    initialValues: {
      [CALCULATION_SALARY_KEYS.START_DATE]: convertToUIDateFormat(
        application?.calculation?.startDate
      ),
      [CALCULATION_SALARY_KEYS.END_DATE]: convertToUIDateFormat(
        application?.calculation?.endDate
      ),
      [CALCULATION_SALARY_KEYS.MONTHLY_PAY]:
        application?.calculation?.monthlyPay,
      [CALCULATION_SALARY_KEYS.OTHER_EXPENSES]:
        application?.calculation?.otherExpenses,
      [CALCULATION_SALARY_KEYS.STATE_AID_MAX_PERCENTAGE]:
        application?.calculation?.stateAidMaxPercentage,
      [CALCULATION_SALARY_KEYS.VACATION_MONEY]:
        application?.calculation?.vacationMoney,
    },
    validationSchema: getValidationSchema(t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: calculateSalaryBenefit,
  });
  const { errors, touched, setFieldValue, values } = formik;
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { startDate, endDate } = values;

  const grantedPeriod = React.useMemo(
    () => diffMonths(parseDate(endDate), parseDate(startDate)),
    [endDate, startDate]
  );

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const pairs = Object.values(CALCULATION_SALARY_KEYS).map<
      [CALCULATION_SALARY_KEYS, Field<CALCULATION_SALARY_KEYS>]
    >((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`common:calculators.fields.${fieldName}.label`),
        placeholder: t(`common:calculators.fields.${fieldName}.placeholder`),
      },
    ]);

    return fromPairs<Field<CALCULATION_SALARY_KEYS>>(pairs) as Record<
      CALCULATION_SALARY_KEYS,
      Field<CALCULATION_SALARY_KEYS>
    >;
  }, [t]);

  const stateAidMaxPercentageOptions = React.useMemo(
    (): OptionType[] =>
      STATE_AID_MAX_PERCENTAGE_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      })),
    []
  );

  const getStateAidMaxPercentageSelectValue = (): OptionType | undefined =>
    stateAidMaxPercentageOptions.find(
      (o) => o.value?.toString() === values?.stateAidMaxPercentage?.toString()
    );

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
    calculationsErrors,
    getErrorMessage,
    handleSubmit,
    stateAidMaxPercentageOptions,
    getStateAidMaxPercentageSelectValue,
  };
};

export { useSalaryBenefitCalculatorData };
