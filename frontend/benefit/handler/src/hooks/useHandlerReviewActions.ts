import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import {
  CalculationFormProps,
  HandledAplication,
} from 'benefit/handler/types/application';
import { Application, ApplicationData } from 'benefit-shared/types/application';
import { ErrorData } from 'benefit-shared/types/common';
import camelcaseKeys from 'camelcase-keys';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

import { useApplicationActions } from './useApplicationActions';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface HandlerReviewActions {
  onCalculateEmployment: (calculator: CalculationFormProps) => void;
  onSaveAndClose: () => void;
  onDone: () => void;
  onCancel: (cancelledApplication: HandledAplication) => void;
  calculationsErrors: ErrorData | undefined | null;
  calculateSalaryBenefit: (values: CalculationFormProps) => void;
}

const useHandlerReviewActions = (
  application: Application,
  isManualCalculator?: boolean
): HandlerReviewActions => {
  const updateApplicationQuery = useUpdateApplicationQuery();
  const [calculationsErrors, setCalculationErrors] = useState<
    ErrorData | undefined | null
  >();

  const router = useRouter();

  const { handledApplication } = React.useContext(AppContext);

  const { updateStatus } = useApplicationActions(application);

  // ACCEPTED, REJECTED
  const onDone = React.useCallback((): void => {
    if (handledApplication?.status) {
      updateStatus(
        handledApplication.status,
        handledApplication.logEntryComment,
        handledApplication.grantedAsDeMinimisAid
      );
    }
  }, [handledApplication, updateStatus]);

  // CANCELL
  const onCancel = (cancelledApplication: HandledAplication): void => {
    if (cancelledApplication?.status) {
      updateStatus(
        cancelledApplication.status,
        cancelledApplication.logEntryComment,
        false
      );
    }
  };

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
        calculation: application.calculation
          ? {
              ...application.calculation,
              monthlyPay: stringToFloatValue(
                application.calculation.monthlyPay
              ),
              otherExpenses: stringToFloatValue(
                application.calculation.otherExpenses
              ),
              vacationMoney: stringToFloatValue(
                application.calculation.vacationMoney
              ),
              overrideMonthlyBenefitAmount: stringToFloatValue(
                application.calculation.overrideMonthlyBenefitAmount
              ),
              startDate,
              endDate,
            }
          : undefined,
      },
      { deep: true }
    ) as ApplicationData;
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

    const overrideMonthlyBenefitAmountComment = !isEmpty(
      values.overrideMonthlyBenefitAmount
    )
      ? values.overrideMonthlyBenefitAmountComment
      : '';

    const paySubsidies = isManualCalculator
      ? []
      : values.paySubsidies?.map((item) => ({
          ...item,
          workTimePercent: stringToFloatValue(item.workTimePercent),
          startDate: convertToBackendDateFormat(item.startDate),
          endDate: convertToBackendDateFormat(item.endDate),
        }));

    const trainingCompensations = values.trainingCompensations?.map((item) => ({
      ...item,
      monthlyAmount: stringToFloatValue(item.monthlyAmount),
      startDate: convertToBackendDateFormat(item.startDate),
      endDate: convertToBackendDateFormat(item.endDate),
    }));

    const {
      monthlyPay,
      vacationMoney,
      stateAidMaxPercentage,
      otherExpenses,
      overrideMonthlyBenefitAmount,
    } = values;

    const emptyCalculation = {
      ...application.calculation,
      start_date: null,
      end_date: null,
      state_aid_max_percentage: null,
      granted_as_de_minimis_aid: false,
      target_group_check: false,
      calculated_benefit_amount: null,
      override_monthly_benefit_amount: null,
      override_monthly_benefit_amount_comment: '',
      rows: [],
      handler_details: null,
      duration_in_months_rounded: null,
    };

    return snakecaseKeys(
      {
        ...application,
        calculation:
          application.calculation && isManualCalculator
            ? {
                ...application.calculation,
                startDate,
                endDate,
                monthlyPay: stringToFloatValue(monthlyPay),
                otherExpenses: stringToFloatValue(otherExpenses),
                vacationMoney: stringToFloatValue(vacationMoney),
                overrideMonthlyBenefitAmount: stringToFloatValue(
                  overrideMonthlyBenefitAmount
                ),
                stateAidMaxPercentage,
                overrideMonthlyBenefitAmountComment,
              }
            : emptyCalculation,
        paySubsidies,
        trainingCompensations,
      },
      { deep: true }
    ) as ApplicationData;
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

  const onSaveAndClose = (): void => {
    void router.push(ROUTES.HOME);
  };

  return {
    onCalculateEmployment,
    onSaveAndClose,
    onDone,
    onCancel,
    calculateSalaryBenefit,
    calculationsErrors,
  };
};

export default useHandlerReviewActions;
