import {
  Application,
  ApplicationData,
} from 'benefit/handler/types/application';
import { getApplicationStepString } from 'benefit/handler/utils/common';
import snakecaseKeys from 'snakecase-keys';

import { APPLICATION_STATUSES } from '../constants';
import useUpdateApplicationQuery from './useUpdateApplicationQuery';

type ExtendedComponentProps = {
  updateStatus: (newStatus: APPLICATION_STATUSES) => void;
};

const useApplicationActions = (
  application: Application
): ExtendedComponentProps => {
  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const updateStatus = (status: APPLICATION_STATUSES): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        status,
        applicationStep: getApplicationStepString(1),
      },
      { deep: true }
    );
    updateApplication(currentApplicationData);
    window.scrollTo(0, 0);
  };

  return {
    updateStatus,
  };
};

export { useApplicationActions };
