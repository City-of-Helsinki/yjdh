import Application from 'shared/types/application-form-data';
import Employment from 'shared/types/employment';

type ApplicationFieldName = keyof Application | keyof Employment;

export default ApplicationFieldName;
