import EmploymentFieldSummary from 'kesaseteli/employer/components/application/summary/EmploymentFieldSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import Employment from 'shared/types/employment';
import { getApplicationFormFieldLabel as getLabel } from 'shared/utils/application.utils';
import { getAttachmentsSummary } from 'shared/utils/attachment.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

type Props = {
  index: number;
};

const EmploymentSummary: React.FC<Props> = ({ index }) => {
  const { applicationQuery } = useApplicationApi<Employment>(
    (application) => application.summer_vouchers[index]
  );

  const { t } = useTranslation();

  if (applicationQuery.isSuccess) {
    const {
      employee_name,
      employee_ssn,
      summer_voucher_exception_reason,
      employment_contract,
      payslip,
      employment_start_date,
      employment_end_date,
      employment_description,
      hired_without_voucher_assessment,
    } = applicationQuery.data;

    return (
      <>
        <FormSectionHeading
          header={`${employee_name ?? ''} ${employee_ssn ?? ''}`}
          size="s"
          as="h3"
          data-testid={`employee-info-${index}`}
        />
        <EmploymentFieldSummary
          fieldName="summer_voucher_exception_reason"
          index={index}
        >
          {t(
            `common:application.form.selectionGroups.summer_voucher_exception_reason.${
              summer_voucher_exception_reason ?? ''
            }`
          )}
        </EmploymentFieldSummary>
        <EmploymentFieldSummary fieldName="employee_postcode" index={index} />
        <EmploymentFieldSummary fieldName="employee_home_city" index={index} />
        <EmploymentFieldSummary
          fieldName="employee_phone_number"
          index={index}
        />
        <EmploymentFieldSummary fieldName="employment_postcode" index={index} />
        <EmploymentFieldSummary
          fieldName="summer_voucher_serial_number"
          index={index}
        />
        <EmploymentFieldSummary fieldName="employee_school" index={index} />
        <EmploymentFieldSummary fieldName="employment_contract" index={index}>
          {t(`common:application.form.inputs.employment_contract`)}:{' '}
          {getAttachmentsSummary(employment_contract)}
        </EmploymentFieldSummary>
        <EmploymentFieldSummary fieldName="payslip" index={index}>
          {t(`common:application.form.inputs.payslip`)}:{' '}
          {getAttachmentsSummary(payslip)}
        </EmploymentFieldSummary>
        <EmploymentFieldSummary fieldName="employment" index={index}>
          {t('common:application.step2.employment')}:{' '}
          {convertToUIDateFormat(employment_start_date)} -{' '}
          {convertToUIDateFormat(employment_end_date)}
        </EmploymentFieldSummary>
        <EmploymentFieldSummary
          fieldName="employment_work_hours"
          index={index}
        />
        <EmploymentFieldSummary
          fieldName="employment_salary_paid"
          index={index}
        />
        {employment_description && (
          <EmploymentFieldSummary
            fieldName="employment_description"
            index={index}
          />
        )}
        <EmploymentFieldSummary
          fieldName="hired_without_voucher_assessment"
          index={index}
        >
          {getLabel(t, 'hired_without_voucher_assessment')}:{' '}
          {t(
            `common:application.form.selectionGroups.hired_without_voucher_assessment.${
              hired_without_voucher_assessment ?? ''
            }`
          )}
        </EmploymentFieldSummary>
      </>
    );
  }
  return <PageLoadingSpinner />;
};
export default EmploymentSummary;
