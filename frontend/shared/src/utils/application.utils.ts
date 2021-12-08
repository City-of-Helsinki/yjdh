import { TFunction } from 'next-i18next';

import Application from '../types/application';
import ApplicationFieldName from '../types/application-field-name';
import Employment from '../types/employment';
import { getAttachmentsByType } from './attachment.utils';

export const getApplicationFormFieldLabel = (
  t: TFunction,
  field: ApplicationFieldName
): string => t(`common:application.form.inputs.${String(field)}`);

export const getFormApplication = (
  backendApplication: Application
): Application => ({
  ...backendApplication,
  summer_vouchers: (backendApplication.summer_vouchers ?? []).map(
    (employment) =>
      ({
        ...employment,
        employment_contract: getAttachmentsByType(
          employment.attachments ?? [],
          'employment_contract'
        ),
        payslip: getAttachmentsByType(employment.attachments ?? [], 'payslip'),
      } as Employment)
  ),
});

export const getFullName = (
  firstName: string | undefined,
  lastName: string | undefined
): string => [firstName, lastName].join(' ').trim();
