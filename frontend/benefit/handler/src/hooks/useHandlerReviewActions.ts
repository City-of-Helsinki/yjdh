import AppContext from 'benefit/handler/context/AppContext';
import {
  CalculationFormProps,
  HandledAplication,
} from 'benefit/handler/types/application';
import { Application, ApplicationData } from 'benefit-shared/types/application';
import { ErrorData } from 'benefit-shared/types/common';
import camelcaseKeys from 'camelcase-keys';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

import { useRouterNavigation } from './applicationHandling/useRouterNavigation';
import { useApplicationActions } from './useApplicationActions';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface HandlerReviewActions {
  onCalculateEmployment: (calculator: CalculationFormProps) => void;
  onSaveAndClose: () => void;
  onDone: () => void;
  onCancel: (cancelledApplication: HandledAplication) => void;
  calculateSalaryBenefit: (values: CalculationFormProps) => void;
}

const useHandlerReviewActions = (
  application: Application,
  setCalculationErrors?: React.Dispatch<React.SetStateAction<ErrorData>>
): HandlerReviewActions => {
  const updateApplicationQuery = useUpdateApplicationQuery();

  const { handledApplication } = React.useContext(AppContext);

  const { updateStatus } = useApplicationActions(application);

  const { t } = useTranslation();

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

    const paySubsidies = values.paySubsidies?.map((item) => ({
      ...item,
      workTimePercent: stringToFloatValue(item.workTimePercent),
      startDate: convertToBackendDateFormat(item.startDate) || null,
      endDate: convertToBackendDateFormat(item.endDate) || null,
    }));

    const trainingCompensations = values.trainingCompensations?.map((item) => ({
      ...item,
      monthlyAmount: stringToFloatValue(item.monthlyAmount),
      startDate: convertToBackendDateFormat(item.startDate) || null,
      endDate: convertToBackendDateFormat(item.endDate) || null,
    }));

    const {
      monthlyPay,
      vacationMoney,
      stateAidMaxPercentage,
      otherExpenses,
      overrideMonthlyBenefitAmount,
    } = values;

    return snakecaseKeys(
      {
        ...application,
        calculation: application.calculation
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
          : undefined,
        paySubsidies,
        trainingCompensations,
      },
      { deep: true }
    ) as ApplicationData;
  };

  useEffect(() => {
    if (!setCalculationErrors) return;
    if (updateApplicationQuery.error) {
      // Can parse error codes from data on 400s, set generic error on 500
      if (
        updateApplicationQuery.error.response?.status >= 400 &&
        updateApplicationQuery.error.response?.status < 500
      ) {
        setCalculationErrors(
          camelcaseKeys(updateApplicationQuery.error.response?.data ?? {})
        );
      } else {
        setCalculationErrors({
          calculation: {
            unknownField: t('common:calculators.notifications.error.message'),
          },
        } as ErrorData);
      }
    } else {
      setCalculationErrors(null);
    }
  }, [updateApplicationQuery.error, setCalculationErrors, t]);

  const onCalculateEmployment = (calculator: CalculationFormProps): void => {
    void updateApplicationQuery.mutate(getDataEmployment(calculator));
  };

  const calculateSalaryBenefit = (values: CalculationFormProps): void => {
    void updateApplicationQuery.mutate(getSalaryBenefitData(values));
  };

  const { navigateBack } = useRouterNavigation(application.status);

  const onSaveAndClose = (): void => {
    void navigateBack();
  };

  return {
    onCalculateEmployment,
    onSaveAndClose,
    onDone,
    onCancel,
    calculateSalaryBenefit,
  };
};

export default useHandlerReviewActions;
