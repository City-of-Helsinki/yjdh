export const YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION = [
  'submitted',
  'additional_information_requested',
] as const;
export const YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION = [
  'awaiting_manual_processing',
  'additional_information_provided',
] as const;
export const YOUTH_APPLICATION_STATUS_COMPLETED = [
  'accepted',
  'rejected',
] as const;
export const YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED = [
  ...YOUTH_APPLICATION_STATUS_WAITING_FOR_YOUTH_ACTION,
  ...YOUTH_APPLICATION_STATUS_COMPLETED,
] as const;
export const YOUTH_APPLICATION_STATUS = [
  ...YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED,
  ...YOUTH_APPLICATION_STATUS_WAITING_FOR_HANDLER_ACTION,
] as const;
