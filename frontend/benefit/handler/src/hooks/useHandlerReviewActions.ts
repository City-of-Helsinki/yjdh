import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

import { APPLICATION_STATUSES, ROUTES } from '../constants';
import AppContext from '../context/AppContext';
import {
  Application,
  ApplicationData,
  CalculationFormProps,
  PaySubsidy,
} from '../types/application';
import { ErrorData } from '../types/common';
import { useApplicationActions } from './useApplicationActions';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface HandlerReviewActions {
  onCalculateEmployment: (calculator: CalculationFormProps) => void;
  onSaveAndClose: () => void;
  onDone: () => void;
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

  const router = useRouter();

  const { handledApplication } = React.useContext(AppContext);

  const { updateStatus } = useApplicationActions(application);

  // ACCEPTED, REJECTED, CANCELLED
  const onDone = React.useCallback((): void => {
    if (handledApplication?.status) {
      updateStatus(
        handledApplication.status,
        handledApplication.logEntryComment
      );
    }
  }, [handledApplication, updateStatus]);

  // workaround for cancellation, untill hds dialog is fixed
  useEffect(() => {
    if (
      handledApplication?.status === APPLICATION_STATUSES.CANCELLED &&
      handledApplication.logEntryComment
    ) {
      onDone();
    }
  }, [handledApplication, onDone]);

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

  const onSaveAndClose = (): void => {
    void router.push(ROUTES.HOME);
  };

  return {
    onCalculateEmployment,
    onSaveAndClose,
    onDone,
    calculateSalaryBenefit,
    calculationsErrors,
  };
};

export default useHandlerReviewActions;
