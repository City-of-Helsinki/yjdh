import { useTranslation } from 'benefit/applicant/i18n';
import camelcaseKeys from 'camelcase-keys';
import React, { useEffect } from 'react';
import hdsToast from 'shared/components/toast/Toast';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import snakecaseKeys from 'snakecase-keys';

import {
  Application,
  ApplicationData,
  Calculation,
  CalculationCommon,
} from '../types/application';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

interface HandlerReviewActions {
  onCalculateEmployment: (calculator: CalculationCommon) => void;
}

const useHandlerReviewActions = (
  application: Application
): HandlerReviewActions => {
  const { mutate: updateApplication, error: updateApplicationError } =
    useUpdateApplicationQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (updateApplicationError) {
      const errorData = camelcaseKeys(
        updateApplicationError.response?.data ?? {}
      );
      hdsToast({
        autoDismissTime: 0,
        type: 'error',
        labelText: t('common:error.generic.label'),
        text: Object.entries(
          errorData[Object.keys(errorData)[0] as keyof unknown] as Calculation
        ).map(([key, value]) => (
          <a key={key} href={`#${key}`}>
            {`${key}: ${String(value)}`}
          </a>
        )),
      });
    }
  }, [t, updateApplicationError]);

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

  const onCalculateEmployment = async (
    calculator: CalculationCommon
  ): Promise<ApplicationData | void> => {
    try {
      await updateApplication(getDataEmployment(calculator));
    } catch (error) {
      // useEffect will catch this error
    }

    return undefined;
  };

  return {
    onCalculateEmployment,
  };
};

export default useHandlerReviewActions;
