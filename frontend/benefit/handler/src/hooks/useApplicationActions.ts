import { getApplicationStepString } from 'benefit/handler/utils/common';
import { APPLICATION_STATUSES } from 'benefit-shared//constants';
import { Application, ApplicationData } from 'benefit-shared/types/application';
import { stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

import useUpdateApplicationQuery from './useUpdateApplicationQuery';

type ExtendedComponentProps = {
  updateStatus: (
    newStatus: APPLICATION_STATUSES,
    logEntryComment?: string,
    grantedAsDeMinimisAid?: boolean
  ) => void;
  isUpdatingApplication: boolean;
};

const useApplicationActions = (
  application: Application
): ExtendedComponentProps => {
  const updateApplicationQuery = useUpdateApplicationQuery();

  const updateStatus = (
    status: APPLICATION_STATUSES,
    logEntryComment?: string,
    grantedAsDeMinimisAid?: boolean
  ): void => {
    const currentApplicationData = snakecaseKeys(
      {
        ...application,
        status,
        logEntryComment,
        calculation: application.calculation ? {
          ...application.calculation,
          monthlyPay: stringToFloatValue(application.calculation.monthlyPay),
          otherExpenses: stringToFloatValue(
            application.calculation.otherExpenses
          ),
          vacationMoney: stringToFloatValue(
            application.calculation.vacationMoney
          ),
          overrideMonthlyBenefitAmount: stringToFloatValue(
            application.calculation.overrideMonthlyBenefitAmount
          ),
          grantedAsDeMinimisAid,
        } : undefined,
        applicationStep: getApplicationStepString(1),
      },
      { deep: true }
    ) as ApplicationData;
    updateApplicationQuery.mutate(currentApplicationData);
    window.scrollTo(0, 0);
  };

  return {
    updateStatus,
    isUpdatingApplication: updateApplicationQuery.isLoading,
  };
};

export { useApplicationActions };
