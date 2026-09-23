export enum YouthApplicationStatus {
  SUBMITTED = 'submitted',
  /** @deprecated No longer used, unassigned applications go to ADDITIONAL_INFORMATION_PROVIDED */
  AWAITING_MANUAL_PROCESSING = 'awaiting_manual_processing',
  ADDITIONAL_INFORMATION_REQUESTED = 'additional_information_requested',
  ADDITIONAL_INFORMATION_PROVIDED = 'additional_information_provided',
  APPLICATION_HANDLING = 'application_handling',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}
