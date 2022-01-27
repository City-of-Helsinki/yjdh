import Axios from 'axios';
import CREATION_ERROR_TYPES from 'kesaseteli/youth/components/constants/creation-error-types';
import YouthApplicationCreationError, {
  ErrorType,
} from 'kesaseteli/youth/types/youth-application-creation-error';

export const isYouthApplicationCreationError = (
  error: unknown
): error is YouthApplicationCreationError =>
  Axios.isAxiosError(error) &&
  Boolean(
    error.response &&
      CREATION_ERROR_TYPES.includes(
        (error as YouthApplicationCreationError).response.data.code
      )
  );
