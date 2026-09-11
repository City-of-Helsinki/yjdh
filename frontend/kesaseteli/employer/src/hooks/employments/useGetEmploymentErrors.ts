import Application from 'kesaseteli-shared/types/application-form-data';
import Employment from 'kesaseteli-shared/types/employment';
import { DeepMap, FieldError, get, useFormContext } from 'react-hook-form';

const useGetEmploymentErrors = (
  index: number
): DeepMap<Employment, FieldError> => {
  const {
    formState: { errors },
  } = useFormContext<Application>();
  return get(errors, `summer_vouchers.${index}`) as DeepMap<
    Employment,
    FieldError
  >;
};
export default useGetEmploymentErrors;
