import { DeepMap, FieldError,get, useFormContext } from 'react-hook-form';
import Application from 'shared/types/employer-application';
import Employment from 'shared/types/employment';

const useGetEmploymentErrors = (index: number): DeepMap<Employment, FieldError>  => {
  const {
    formState: { errors },
  } = useFormContext<Application>();
  return get(errors, `summer_vouchers.${index}`) as DeepMap<Employment, FieldError>;
}
export default useGetEmploymentErrors;
