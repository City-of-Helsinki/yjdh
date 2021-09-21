import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell, $Hr } from 'shared/components/forms/section/FormSection.sc';
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
    <>
      <FormSection
        header={stepTitle}
        tooltip={t('common:application.step3.tooltip')}
        columns={1}
      >
        <FormSectionHeading
          header={t('common:application.step3.employerTitle')}
          size="m"
        />
        <FormSectionHeading
          header={`${company.name}, ${company.business_id}`}
          size="s"
          as="div"
        />
        <$GridCell as="pre">
          {company.industry}, {company.company_form}, {company.postcode}{' '}
          {company.city}
        </$GridCell>
        <$GridCell as="pre">
          {contact_person_name}, {contact_person_email},{' '}
          {contact_person_phone_number}
        </$GridCell>
        <$GridCell as="pre">{street_address}</$GridCell>
        {/* TODO: Laskuttajan Lisäkentät */}
      </FormSection>
      <FormSection
        header={t('common:application.step3.employmentTitle')}
        size="m"
        columns={1}
        withoutDivider
      >
        {summer_vouchers.map((employment) => (
          <>
            <FormSectionHeading
              header={`${employment.employee_name ?? ''} ${
                employment.employee_ssn ?? ''
              }`}
              size="s"
              as="h3"
              key={employment.id}
            />
            <$GridCell as="pre">
              {t(
                `common:application.form.selectionGroups.summer_voucher_exception_reason.${
                  employment.summer_voucher_exception_reason ?? ''
                }`
              )}
            </$GridCell>
            <$GridCell as="pre">
              {t('common:application.form.inputs.employee_postcode')}:{' '}
              {employment.employee_postcode}
            </$GridCell>
            <$GridCell as="pre">
              {t('common:application.form.inputs.employee_home_city')}:{' '}
              {employment.employee_home_city}
            </$GridCell>
            <$GridCell as="pre">
              {t('common:application.form.inputs.employee_phone_number')}:{' '}
              {employment.employee_phone_number},{' '}
              {employment.employment_postcode}
            </$GridCell>
            <$GridCell as="pre">
              {t('common:application.form.inputs.employment_postcode')}:{' '}
              {employment.employment_postcode}
            </$GridCell>
            <$GridCell as="pre">
              {t('common:application.form.inputs.summer_voucher_serial_number')}
              : {employment.summer_voucher_serial_number},{' '}
              {employment.employee_school}
            </$GridCell>
            {/* TODO: palkkatodistus, työsopimus attachments */}
            <$GridCell as="pre">
              {t('common:application.step2.employment')}:{' '}
              {employment.employment_start_date}-
              {employment.employment_end_date}
            </$GridCell>
            <$GridCell as="pre">
              {t('common:application.form.inputs.employment_work_hours')}:{' '}
              {employment.employment_work_hours},{' '}
              {t('common:application.form.inputs.employment_salary_paid')}:{' '}
              {employment.employment_salary_paid}{' '}
            </$GridCell>
            {employment.employment_description && (
              <>
                <$GridCell as="pre">
                  {t('common:application.form.inputs.employment_description')}:
                </$GridCell>
                <$GridCell as="pre">
                  {employment.employment_description}
                </$GridCell>
              </>
            )}
            <$GridCell as="pre">
              {t(
                'common:application.form.inputs.hired_without_voucher_assessment'
              )}
              :{' '}
              {t(
                `common:application.form.selectionGroups.hired_without_voucher_assessment.${
                  employment.hired_without_voucher_assessment ?? ''
                }`
              )}
            </$GridCell>
            <$Hr />
          </>
        ))}
      </FormSection>
    </>
  );
};
export default ApplicationSummary;
