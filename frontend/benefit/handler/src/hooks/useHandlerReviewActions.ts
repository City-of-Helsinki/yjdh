import camelcaseKeys from 'camelcase-keys';
import { useEffect, useState } from 'react';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

import {
  ApplicationData,
  CalculationCommon,
  HandlerApplication,
  PaySubsidy,
  SalaryCalculation,
} from '../types/application';
import { ErrorData } from '../types/common';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface HandlerReviewActions {
  onCalculateEmployment: (calculator: CalculationCommon) => void;
  calculationsErrors: ErrorData | undefined | null;
  calculateSalaryBenefit: (values: SalaryCalculation) => void;
}

const useHandlerReviewActions = (
  application: HandlerApplication
): HandlerReviewActions => {
  const updateApplicationQuery = useUpdateApplicationQuery();
  const [calculationsErrors, setCalculationErrors] = useState<
    ErrorData | undefined | null
  >();

  const getDataEmployment = (values: CalculationCommon): ApplicationData => {
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

  const getSalaryBenefitData = (values: SalaryCalculation): ApplicationData => {
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
        },
        paySubsidies: application.paySubsidies.map(
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

  const onCalculateEmployment = (calculator: CalculationCommon): void => {
    void updateApplicationQuery.mutate(getDataEmployment(calculator));
  };

  const calculateSalaryBenefit = (values: SalaryCalculation): void => {
    void updateApplicationQuery.mutate(getSalaryBenefitData(values));
  };

  return {
    onCalculateEmployment,
    calculationsErrors,
    calculateSalaryBenefit,
  };
};

export default useHandlerReviewActions;
