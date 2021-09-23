import EmploymentFieldSummary from 'kesaseteli/employer/components/application/summary/EmploymentFieldSummary';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import Employment from 'shared/types/employment';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

type Props = {
  employment: Employment;
  index: number;
};

const EmploymentSummary: React.FC<Props> = ({ index, employment }) => {
  const {
    id,
    summer_voucher_exception_reason,
    employee_name,
    employee_ssn,
    employment_start_date, // yyyy-MM-dd
    employment_end_date, // yyyy-MM-dd
    employment_work_hours,
    employment_salary_paid,
    employment_description,
    hired_without_voucher_assessment,
  } = employment;

  const { t } = useTranslation();

  return (
    <>
      <FormSectionHeading
        header={`${employee_name ?? ''} ${employee_ssn ?? ''}`}
        size="s"
        as="h3"
        key={id}
        data-testid={`employee-info-${index}`}
      />
      <EmploymentFieldSummary
        fieldName="summer_voucher_exception_reason"
        employment={employment}
        index={index}
      >
        {t(
          `common:application.form.selectionGroups.summer_voucher_exception_reason.${
            summer_voucher_exception_reason ?? ''
          }`
        )}
      </EmploymentFieldSummary>
      <EmploymentFieldSummary
        fieldName="employee_postcode"
        employment={employment}
        index={index}
      />
      <EmploymentFieldSummary
        fieldName="employee_home_city"
        employment={employment}
        index={index}
      />
      <EmploymentFieldSummary
        fieldName="employee_phone_number"
        employment={employment}
        index={index}
      />
      <EmploymentFieldSummary
        fieldName="employment_postcode"
        employment={employment}
        index={index}
      />
      <EmploymentFieldSummary
        fieldName="summer_voucher_serial_number"
        employment={employment}
        index={index}
      />
      <EmploymentFieldSummary
        fieldName="employee_school"
        employment={employment}
        index={index}
      />
      {/* TODO: palkkatodistus, työsopimus attachments */}
      <EmploymentFieldSummary
        fieldName="employment"
        employment={employment}
        index={index}
      >
        {t('common:application.step2.employment')}:{' '}
        {convertToUIDateFormat(employment_start_date)} -{' '}
        {convertToUIDateFormat(employment_end_date)}
      </EmploymentFieldSummary>
      <EmploymentFieldSummary
        fieldName="employment_work_hours"
        employment={employment}
        index={index}
      >
        {t('common:application.form.inputs.employment_work_hours')}:{' '}
        {employment_work_hours},{' '}
        {t('common:application.form.inputs.employment_salary_paid')}:{' '}
        {employment_salary_paid}{' '}
      </EmploymentFieldSummary>
      {employment_description && (
        <EmploymentFieldSummary
          fieldName="employment_description"
          employment={employment}
          index={index}
        />
      )}
      <EmploymentFieldSummary
        fieldName="hired_without_voucher_assessment"
        employment={employment}
        index={index}
      >
        {t('common:application.form.inputs.hired_without_voucher_assessment')}:{' '}
        {t(
          `common:application.form.selectionGroups.hired_without_voucher_assessment.${
            hired_without_voucher_assessment ?? ''
          }`
        )}
      </EmploymentFieldSummary>
    </>
  );
};
export default EmploymentSummary;
