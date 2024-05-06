import type { ApplicationWithoutSsnFieldName } from 'kesaseteli/handler/types/application-without-ssn-types';
import { TFunction } from 'next-i18next';

export const getApplicationWithoutSsnFormFieldLabel = (
  t: TFunction,
  field: ApplicationWithoutSsnFieldName
): string => t(`common:applicationWithoutSsn.form.inputs.${String(field)}`);
