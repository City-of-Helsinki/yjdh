import { YouthApplicationStatus } from '../constants/youth-application-status';

type YouthApplicationStatusType =
  (typeof YouthApplicationStatus)[keyof typeof YouthApplicationStatus];

export default YouthApplicationStatusType;
