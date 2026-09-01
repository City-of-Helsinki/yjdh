import { EmployerApplicationStatus } from '../constants/employer-application-status';

type EmployerApplicationStatusType =
  (typeof EmployerApplicationStatus)[keyof typeof EmployerApplicationStatus];

export default EmployerApplicationStatusType;
