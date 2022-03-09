import {
  Application,
  ApplicationData,
} from 'benefit/handler/types/application';
import { getApplicationStepString } from 'benefit/handler/utils/common';
import snakecaseKeys from 'snakecase-keys';

import { APPLICATION_STATUSES } from '../constants';
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
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        status,
        logEntryComment,
        calculation: { ...application.calculation, grantedAsDeMinimisAid },
        applicationStep: getApplicationStepString(1),
      },
      { deep: true }
    );
    updateApplicationQuery.mutate(currentApplicationData);
    window.scrollTo(0, 0);
  };

  return {
    updateStatus,
    isUpdatingApplication: updateApplicationQuery.isLoading,
  };
};

export { useApplicationActions };
