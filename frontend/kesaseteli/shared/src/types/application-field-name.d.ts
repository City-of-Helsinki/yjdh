import Application from './application-form-data';
import Employment from './employment';

type ApplicationFieldName = keyof Application | keyof Employment;

export default ApplicationFieldName;
