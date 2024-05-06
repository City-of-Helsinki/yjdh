import Axios from 'axios';
import { BACKEND_TO_FRONTEND_FIELD } from 'kesaseteli/handler/constants/data-mappings';
import YouthApplicationValidationError from 'kesaseteli-shared/types/youth-application-validation-error';

export const isApplicationWithoutSsnValidationError = (
  error: unknown
): error is YouthApplicationValidationError =>
  Axios.isAxiosError(error) &&
  Boolean(
    error.response &&
      error.response?.status === 400 &&
      Object.keys(BACKEND_TO_FRONTEND_FIELD).some((field) =>
        Object.keys(
          (error.response?.data ?? {}) as Record<string, unknown>
        ).includes(field)
      )
  );
