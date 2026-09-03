import { YouthApplicationStatus } from 'kesaseteli-shared/constants/youth-application-status';
import YouthApplicationStatusType from 'kesaseteli-shared/types/youth-application-status-type';

export const YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION = [
  YouthApplicationStatus.SUBMITTED,
  YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
] as const satisfies readonly YouthApplicationStatusType[];

export const YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION = [
  YouthApplicationStatus.AWAITING_MANUAL_PROCESSING,
  YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
] as const satisfies readonly YouthApplicationStatusType[];

export const YOUTH_APPLICATION_STATUS_COMPLETED = [
  YouthApplicationStatus.ACCEPTED,
  YouthApplicationStatus.REJECTED,
] as const satisfies readonly YouthApplicationStatusType[];

export const YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED = [
  ...YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION,
  ...YOUTH_APPLICATION_STATUS_COMPLETED,
] as const satisfies readonly YouthApplicationStatusType[];
