type Status =
  | 'draft'
  | 'submitted'
  | 'additional_information_requested'
  | 'additional_information_provided'
  | 'accepted'
  | 'rejected'
  | 'deleted_by_customer'
  | 'received_by_payment_system';

export default Status;
