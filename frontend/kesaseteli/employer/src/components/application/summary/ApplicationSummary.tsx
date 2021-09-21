import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

const ApplicationSummary: React.FC = () => {
  const { t } = useTranslation();
  const { application, isLoading } = useApplicationApi();
  if (!application || isLoading) {
    return <PageLoadingSpinner />;
  }
  const {
    company,
    contact_person_name,
    contact_person_phone_number,
    street_address,
    contact_person_email,
    summer_vouchers,
  } = application;

  const stepTitle = t('common:application.step3.header');
  return (
    <FormSection
      header={stepTitle}
      tooltip={t('common:application.step3.tooltip')}
      columns={1}
    >
      <FormSectionHeading
        header={t('common:application.step3.employerTitle')}
        size="l"
      />
      <FormSectionHeading
        header={`${company.name}, ${company.business_id}`}
        size="m"
      />
      <p>
        {company.industry}, {company.company_form}, {company.postcode}{' '}
        {company.city}
      </p>
      <p>
        {contact_person_name}, {contact_person_email},{' '}
        {contact_person_phone_number}
      </p>
      <p>{street_address}</p>
      {/* TODO: Laskuttajan Lisäkentät */}
      <FormSectionHeading
        header={t('common:application.step3.employmentTitle')}
        size="l"
      />
      {summer_vouchers.map((employment) => (
        <React.Fragment key={employment.id}>
          <FormSectionHeading
            header={`${employment.employee_name ?? ''} ${
              employment.employee_ssn ?? ''
            }`}
            size="m"
          />
          <p>
            {t(
              `common:application.form.selectionGroups.summer_voucher_exception_reason.${
                employment.summer_voucher_exception_reason ?? ''
              }`
            )}
          </p>
          <p>
            {employment.employee_postcode} {employment.employee_home_city},{' '}
            {employment.employee_phone_number}, {employment.employment_postcode}
          </p>
          <p>
            {t('common:application.form.inputs.summer_voucher_serial_number')}:{' '}
            {employment.summer_voucher_serial_number},{' '}
            {employment.employee_school}
          </p>
          {/* TODO: palkkatodistus, työsopimus attachments */}
          <p>
            {t('common:application.step2.employment')}:{' '}
            {employment.employment_start_date}-{employment.employment_end_date}
          </p>
          <p>
            {t('common:application.form.inputs.employment_work_hours')}:{' '}
            {employment.employment_work_hours},{' '}
            {t('common:application.form.inputs.employment_salary_paid')}:{' '}
            {employment.employment_salary_paid}{' '}
          </p>
          <p>{t('common:application.form.inputs.employment_description')}:</p>
          <p>{employment.employment_description ?? '-'}</p>
          <p>
            {t(
              'common:application.form.inputs.hired_without_voucher_assessment'
            )}
            :{' '}
            {t(
              `common:application.form.selectionGroups.hired_without_voucher_assessment.${
                employment.hired_without_voucher_assessment ?? ''
              }`
            )}
          </p>
        </React.Fragment>
      ))}
    </FormSection>
  );
};
export default ApplicationSummary;
