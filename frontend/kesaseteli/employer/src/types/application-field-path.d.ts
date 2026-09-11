import ApplicationFormData from 'kesaseteli-shared/types/application-form-data';
import { UseFormRegister } from 'react-hook-form';

type ApplicationFieldPath = NonNullable<
  Parameters<UseFormRegister<ApplicationFormData>>[0]
>;

export default ApplicationFieldPath;
