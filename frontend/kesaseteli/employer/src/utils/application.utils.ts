import { TFunction } from 'next-i18next';
import ApplicationFieldName from 'shared/types/application-field-name';

export const getApplicationFormFieldLabel = (
  t: TFunction,
  field: ApplicationFieldName
): string => t(`common:application.form.inputs.${field}`);
