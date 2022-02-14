import camelcaseKeys from 'camelcase-keys';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

import {
  Application,
  ApplicationData,
  CalculationFormProps,
  PaySubsidy,
} from '../types/application';
import { ErrorData } from '../types/common';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface HandlerReviewActions {
  onCalculateEmployment: (calculator: CalculationFormProps) => void;
  calculationsErrors: ErrorData | undefined | null;
  calculateSalaryBenefit: (values: CalculationFormProps) => void;
}

const useHandlerReviewActions = (
  application: Application
): HandlerReviewActions => {
  const updateApplicationQuery = useUpdateApplicationQuery();
  const [calculationsErrors, setCalculationErrors] = useState<
    ErrorData | undefined | null
  >();

  const getDataEmployment = (values: CalculationFormProps): ApplicationData => {
    const startDate = values.startDate
      ? convertToBackendDateFormat(values.startDate)
      : undefined;
    const endDate = values.endDate
      ? convertToBackendDateFormat(values.endDate)
      : undefined;
    return snakecaseKeys(
      {
        ...application,
        calculation: {
          ...application.calculation,
          startDate,
          endDate,
        },
      },
      { deep: true }
    );
  };

  const getSalaryBenefitData = (
    values: CalculationFormProps
  ): ApplicationData => {
    const startDate = values.startDate
      ? convertToBackendDateFormat(values.startDate)
      : undefined;
    const endDate = values.endDate
      ? convertToBackendDateFormat(values.endDate)
      : undefined;

    const paySubsidyStartDate = convertToBackendDateFormat(
      values.paySubsidyStartDate
    );
    const paySubsidyEndDate = convertToBackendDateFormat(
      values.paySubsidyEndDate
    );

    const {
      monthlyPay,
      vacationMoney,
      stateAidMaxPercentage,
      otherExpenses,
      paySubsidyPercent,
    } = values;

    const isManualCalculator = !isEmpty(values.overrideMonthlyBenefitAmount);

    const overrideMonthlyBenefitAmount = isManualCalculator
      ? values.overrideMonthlyBenefitAmount
      : null;

    const overrideMonthlyBenefitAmountComment = isManualCalculator
      ? values.overrideMonthlyBenefitAmountComment
      : '';

    return snakecaseKeys(
      {
        ...application,
        calculation: {
          ...application.calculation,
          startDate,
          endDate,
          monthlyPay,
          vacationMoney,
          stateAidMaxPercentage,
          otherExpenses,
          overrideMonthlyBenefitAmount,
          overrideMonthlyBenefitAmountComment,
        },
        paySubsidies: application.paySubsidies?.map(
          (item: PaySubsidy, index: number) => {
            if (index === 0)
              return {
                ...item,
                paySubsidyPercent,
                startDate: paySubsidyStartDate,
                endDate: paySubsidyEndDate,
              };
            return item;
          }
        ),
      },
      { deep: true }
    );
  };

  useEffect(() => {
    if (updateApplicationQuery.error) {
      setCalculationErrors(
        camelcaseKeys(updateApplicationQuery.error?.response?.data ?? {})
      );
    } else {
      setCalculationErrors(null);
    }
  }, [updateApplicationQuery.error, setCalculationErrors]);

  const onCalculateEmployment = (calculator: CalculationFormProps): void => {
    void updateApplicationQuery.mutate(getDataEmployment(calculator));
  };

  const calculateSalaryBenefit = (values: CalculationFormProps): void => {
    void updateApplicationQuery.mutate(getSalaryBenefitData(values));
  };

  return {
    onCalculateEmployment,
    calculationsErrors,
    calculateSalaryBenefit,
  };
};

export default useHandlerReviewActions;
