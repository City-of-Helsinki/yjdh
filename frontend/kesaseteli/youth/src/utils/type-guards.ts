import Axios from 'axios';
import CREATION_ERROR_CODES from 'kesaseteli/youth/components/constants/creation-error-codes';
import YouthApplicationCreationError from 'kesaseteli/youth/types/youth-application-creation-error';

export const isYouthApplicationCreationError = (
  error: unknown
): error is YouthApplicationCreationError =>
  Axios.isAxiosError(error) &&
  Boolean(
    error.response && CREATION_ERROR_CODES.includes(error.response.data.code)
  );
