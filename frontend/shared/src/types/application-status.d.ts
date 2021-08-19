type Status =
  | 'draft'
  | 'submitted'
  | 'additional_information_requested'
  | 'additional_information_provided'
  | 'accepted'
  | 'rejected'
  | 'deleted_by_customer';

export default Status;
