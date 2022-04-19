export const REDIRECT_ERROR_TYPES = [
  'already_assigned',
  'email_in_use',
  'inadmissible_data',
] as const;
export const CHECK_ERROR_TYPES = ['please_recheck_data'] as const;

const CREATION_ERROR_TYPES = [
  ...REDIRECT_ERROR_TYPES,
  ...CHECK_ERROR_TYPES,
] as const;

export default CREATION_ERROR_TYPES;
