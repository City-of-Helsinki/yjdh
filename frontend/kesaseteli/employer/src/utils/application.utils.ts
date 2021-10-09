import { TFunction } from 'next-i18next';
import Application from 'shared/types/application';
import ApplicationFieldName from 'shared/types/application-field-name';
import Employment from 'shared/types/employment';
import { getAttachmentsByType } from 'shared/utils/attachment.utils';

export const getApplicationFormFieldLabel = (
  t: TFunction,
  field: ApplicationFieldName
): string => t(`common:application.form.inputs.${field}`);

export const getFormApplication = (
  backendApplication: Application
): Application => ({
  ...backendApplication,
  summer_vouchers: [
    ...(backendApplication.summer_vouchers ?? []).map(
      (employment) =>
        ({
          ...employment,
          employment_contract: getAttachmentsByType(
            employment.attachments ?? [],
            'employment_contract'
          ),
          payslip: getAttachmentsByType(
            employment.attachments ?? [],
            'payslip'
          ),
        } as Employment)
    ),
  ],
});
