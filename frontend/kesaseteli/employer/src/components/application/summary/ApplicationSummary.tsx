import EmploymentSummary from 'kesaseteli/employer/components/application/summary/EmploymentSummary';
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
          data-testid="company-heading"
        />
        <$GridCell as="pre" data-testid="company-data">
          {company.industry}, {company.company_form}, {company.postcode}{' '}
          {company.city}
        </$GridCell>
        <$GridCell as="pre" data-testid="contact-person">
          {contact_person_name}, {contact_person_email},
          {contact_person_phone_number}
        </$GridCell>
        <$GridCell as="pre" data-testid="street-address">
          {street_address}
        </$GridCell>
        {/* TODO: Laskuttajan Lisäkentät */}
      </FormSection>
      <FormSection
        header={t('common:application.step3.employmentTitle')}
        size="m"
        columns={1}
        withoutDivider
      >
        {summer_vouchers.map((employment, index) => (
          <React.Fragment key={employment.id}>
            <EmploymentSummary employment={employment} index={index} />
            <$Hr />
          </React.Fragment>
        ))}
      </FormSection>
    </>
  );
};
export default ApplicationSummary;
