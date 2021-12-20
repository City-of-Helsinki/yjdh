import {
  Application,
  ApplicationData,
} from 'benefit/handler/types/application';
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
        status: status,
      },
      { deep: true }
    );
    updateApplication(currentApplicationData);
  };

  return {
    updateStatus,
  };
};

export { useApplicationActions };
