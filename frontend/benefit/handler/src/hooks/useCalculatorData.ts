import {
  CALCULATION_TYPES,
  PAY_SUBSIDIES_OVERRIDE,
} from 'benefit/handler/constants';
import {
  Application,
  CalculationFormProps,
} from 'benefit/handler/types/application';
import {
  PAY_SUBSIDY_GRANTED,
  PAY_SUBSIDY_PERCENT,
} from 'benefit-shared/constants';
import { getErrorText } from 'benefit-shared/utils/forms';
import { FormikProps } from 'formik';
import { TFunction, useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import { focusAndScroll } from 'shared/utils/dom.utils';
import { DefaultTheme, useTheme } from 'styled-components';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  theme: DefaultTheme;
  language: Language;
  handleSubmit: () => void;
  handleClear: (confirm: boolean) => true;
  getErrorMessage: (fieldName: string) => string | undefined;
};

const useCalculatorData = (
  calculatorType: CALCULATION_TYPES,
  formik: FormikProps<CalculationFormProps>,
  setIsRecalculationRequired: (value: boolean) => void,
  application: Application
): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const translationsBase = `common:calculators.${calculatorType}`;
  const { t } = useTranslation();

  const { errors, touched, values, dirty } = formik;

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  const handleSubmit = (): void => {
    setIsSubmitted(true);
    void formik.validateForm().then((errs) => {
      const fieldName = Object.keys(errs)[0];
      if (!fieldName) {
        setIsRecalculationRequired(false);
        return formik.submitForm();
      }
      return focusAndScroll(fieldName);
    });
  };

  /**
   * Clear all fields in the calculation form
   * @param confirm true: do the actual clearing, false: just scroll to field
   * @returns true to allow chaining
   */
  const handleClear = (confirm: boolean): true => {
    if (confirm) {
      formik.setFieldValue('endDate', '');
      formik.setFieldValue('startDate', '');
      formik.setFieldValue(
        'workTimePercent',
        String(PAY_SUBSIDY_PERCENT.DEFAULT)
      );
      formik.setFieldValue('monthlyAmount', '');
      formik.setFieldValue(
        'paySubsidies',
        application.paySubsidyGranted === PAY_SUBSIDY_GRANTED.NOT_GRANTED
          ? []
          : [PAY_SUBSIDIES_OVERRIDE]
      );
      formik.setFieldValue('trainingCompensations', []);
      // Manual calculation fields
      formik.setFieldValue('overrideMonthlyBenefitAmount', '');
      formik.setFieldValue('overrideMonthlyBenefitAmountComment', '');
    }
    setTimeout(() => {
      focusAndScroll('monthlyPay');
    }, 20);
    return true;
  };

  useEffect(() => {
    if (dirty) setIsRecalculationRequired(true);
  }, [dirty, values, setIsRecalculationRequired]);

  return {
    t,
    translationsBase,
    theme,
    language,
    getErrorMessage,
    handleSubmit,
    handleClear,
  };
};

export { useCalculatorData };
