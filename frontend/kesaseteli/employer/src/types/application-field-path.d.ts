import { UseFormRegister } from 'react-hook-form';
import ApplicationFormData from 'shared/types/application-form-data';

type ApplicationFieldPath = NonNullable<
  Parameters<UseFormRegister<ApplicationFormData>>[0]
>;

export default ApplicationFieldPath;
