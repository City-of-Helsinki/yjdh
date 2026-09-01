export enum EmployerApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ADDITIONAL_INFORMATION_REQUESTED = 'additional_information_requested',
  ADDITIONAL_INFORMATION_PROVIDED = 'additional_information_provided',
  APPLICATION_HANDLING = 'application_handling',
  PAYMENT_REVIEW = 'payment_review',
  ACCEPTED_FOR_PAYMENT = 'accepted_for_payment',
  SENT_FOR_PAYMENT = 'sent_for_payment',
  RECEIVED_BY_PAYMENT_SYSTEM = 'received_by_payment_system',
  ERROR_IN_PAYMENT = 'error_in_payment',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}
