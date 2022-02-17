import { PAY_SUBSIDY_OPTIONS } from 'benefit/applicant/constants';
import {
  CALCULATION_SALARY_KEYS,
  STATE_AID_MAX_PERCENTAGE_OPTIONS,
} from 'benefit/handler/constants';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import {
  Application,
  CalculationFormProps,
} from 'benefit/handler/types/application';
import { ErrorData } from 'benefit/handler/types/common';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'shared/components/forms/fields/types';
import { OptionType } from 'shared/types/common';
import {
  convertToUIDateFormat,
  diffMonths,
  parseDate,
} from 'shared/utils/date.utils';

import { getValidationSchema } from '../employmentAppliedMoreView/utils/validation';

type ExtendedComponentProps = {
  formik: FormikProps<CalculationFormProps>;
  fields: {
    [key in CALCULATION_SALARY_KEYS]: Field<CALCULATION_SALARY_KEYS>;
  };
  calculationsErrors: ErrorData | undefined | null;
  grantedPeriod: number;
  stateAidMaxPercentageOptions: OptionType[];
  getStateAidMaxPercentageSelectValue: () => OptionType | undefined;
  paySubsidyPercentageOptions: OptionType[];
  getPaySubsidyPercentageSelectValue: (
    percent: number
  ) => OptionType | undefined;
};

const useSalaryBenefitCalculatorData = (
  application: Application
): ExtendedComponentProps => {
  const { t } = useTranslation();

  const { calculateSalaryBenefit, calculationsErrors } =
    useHandlerReviewActions(application);

  const formik = useFormik<CalculationFormProps>({
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
      [CALCULATION_SALARY_KEYS.PAY_SUBSIDIES]: application?.paySubsidies
        ? application?.paySubsidies
        : [],
    },
    validationSchema: getValidationSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: calculateSalaryBenefit,
  });

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

  const paySubsidyPercentageOptions = React.useMemo(
    (): OptionType[] =>
      PAY_SUBSIDY_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      })),
    []
  );

  const { setFieldValue, values } = formik;

  const getStateAidMaxPercentageSelectValue = (): OptionType | undefined => {
    const { stateAidMaxPercentage } = values;
    return stateAidMaxPercentageOptions.find(
      (o) => o.value?.toString() === stateAidMaxPercentage?.toString()
    );
  };

  const getPaySubsidyPercentageSelectValue = (
    percent: number
  ): OptionType | undefined =>
    paySubsidyPercentageOptions.find(
      (o) => o.value?.toString() === percent.toString()
    );

  const { startDate, endDate } = values;

  const grantedPeriod = React.useMemo(
    () => diffMonths(parseDate(endDate), parseDate(startDate)),
    [endDate, startDate]
  );

  useEffect(() => {
    if (grantedPeriod < 0) {
      void setFieldValue(fields.endDate.name, startDate);
    }
  }, [grantedPeriod, startDate, fields.endDate.name, setFieldValue]);

  return {
    formik,
    fields,
    calculationsErrors,
    grantedPeriod,
    stateAidMaxPercentageOptions,
    getStateAidMaxPercentageSelectValue,
    paySubsidyPercentageOptions,
    getPaySubsidyPercentageSelectValue,
  };
};

export { useSalaryBenefitCalculatorData };
