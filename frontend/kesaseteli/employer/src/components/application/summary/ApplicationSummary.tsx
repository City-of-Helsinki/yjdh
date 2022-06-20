import { friendlyFormatIBAN } from 'ibantools';
import { $ApplicationSummaryField } from 'kesaseteli/employer/components/application/summary/ApplicationSummary.sc';
import EmploymentSummary from 'kesaseteli/employer/components/application/summary/EmploymentSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $Hr,
  FormSectionProps,
} from 'shared/components/forms/section/FormSection.sc';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

type Props = {
  header?: FormSectionProps['header'];
  tooltip?: FormSectionProps['tooltip'];
};
const ApplicationSummary: React.FC<Props> = ({ header, tooltip }) => {
  const { t } = useTranslation();
  const { applicationQuery } = useApplicationApi();
  if (applicationQuery.isSuccess) {
    const {
      company,
      contact_person_name,
      contact_person_email,
      contact_person_phone_number,
      street_address,
      bank_account_number,
      summer_vouchers,
    } = applicationQuery.data;

    return (
      <div data-testid="application-summary">
        <FormSection
          header={header}
          tooltip={tooltip}
          columns={1}
          aria-label={t('common:application.step3.employerTitle')}
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
          <$ApplicationSummaryField data-testid="industry">
            {t('common:application.step1.companyInfoGrid.header.industry')}:{' '}
            {company.industry || '-'}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="company_form">
            {t('common:application.step1.companyInfoGrid.header.company_form')}:{' '}
            {company.company_form || '-'}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="postcode">
            {t('common:application.step1.companyInfoGrid.header.postcode')}:{' '}
            {company.postcode || '-'}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="city">
            {t('common:application.step1.companyInfoGrid.header.city')}:{' '}
            {company.city || '-'}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="contact_person_name">
            {t('common:application.form.inputs.contact_person_name')}:{' '}
            {contact_person_name}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="contact_person_email">
            {t('common:application.form.inputs.contact_person_email')}:{' '}
            {contact_person_email}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="contact_person_phone_number">
            {t('common:application.form.inputs.contact_person_phone_number')}:{' '}
            {contact_person_phone_number}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="street_address">
            {t('common:application.form.inputs.street_address')}:{' '}
            {street_address}
          </$ApplicationSummaryField>
          <$ApplicationSummaryField data-testid="bank_account_number">
            {t('common:application.form.inputs.bank_account_number')}:{' '}
            {friendlyFormatIBAN(bank_account_number)}
          </$ApplicationSummaryField>
        </FormSection>
        <FormSection
          header={t('common:application.step3.employmentTitle')}
          size="m"
          columns={1}
          withoutDivider
        >
          {summer_vouchers.map((employment, index) => (
            <React.Fragment key={employment.id}>
              <EmploymentSummary index={index} />
              <$Hr />
            </React.Fragment>
          ))}
        </FormSection>
      </div>
    );
  }
  return <PageLoadingSpinner />;
};

ApplicationSummary.defaultProps = {
  header: '',
  tooltip: '',
};

export default ApplicationSummary;
