import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import Employment from 'shared/types/employment';

export const getEmploymentFieldPath = (
  index: number,
  field: keyof Employment
): ApplicationFieldPath => `summer_vouchers.${index}.${field}`;
