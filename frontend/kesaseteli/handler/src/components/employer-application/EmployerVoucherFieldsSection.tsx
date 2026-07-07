import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import Employment from 'shared/types/employment';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import Field, { $DescriptionList } from '../form/Field';

type Props = {
  voucher: Employment;
};

/**
 * Renders the employer's summer voucher details section (serial number, employment period,
 * work hours, salary, job description, and attachment file lists).
 */
const EmployerVoucherFieldsSection: React.FC<Props> = ({ voucher }) => {
  const { t } = useTranslation();

  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="employer-voucher-heading"
        header={t('common:handlerApplication.voucherTitle')}
        as="h4"
      />

      <$DescriptionList aria-labelledby="employer-voucher-heading">
        <Field
          type="summer_voucher_serial_number"
          value={voucher.summer_voucher_serial_number || '-'}
        />
        <Field
          type="employment_period"
          value={`${convertToUIDateFormat(
            voucher.employment_start_date
          )} – ${convertToUIDateFormat(voucher.employment_end_date)}`}
        />
        <Field
          type="employment_work_hours"
          value={String(voucher.employment_work_hours ?? '-')}
        />
        <Field
          type="employment_salary_paid"
          value={
            voucher.employment_salary_paid != null
              ? `${voucher.employment_salary_paid} €`
              : '-'
          }
        />
        <Field
          type="employment_postcode"
          value={voucher.employment_postcode ?? '-'}
        />
        {voucher.employment_description && (
          <Field
            type="employment_description"
            value={voucher.employment_description}
          />
        )}
        <Field
          type="hired_without_voucher_assessment"
          value={
            voucher.hired_without_voucher_assessment
              ? t(
                  // eslint-disable-next-line no-secrets/no-secrets
                  `common:handlerApplication.hired_without_voucher_assessment_${voucher.hired_without_voucher_assessment}`
                )
              : t(
                  // eslint-disable-next-line no-secrets/no-secrets
                  'common:handlerApplication.hired_without_voucher_assessment_',
                  '-'
                )
          }
        />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerVoucherFieldsSection;
