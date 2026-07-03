import { friendlyFormatIBAN } from 'ibantools';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import Employment from 'shared/types/employment';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import Field from '../form/Field';
import EmployerVoucherSection from './EmployerVoucherSection';

type Props = {
  application: HandlerEmployerApplication;
  voucher: Employment;
};

/**
 * Renders separate invoicer details (name, email, phone number) when the
 * employer has explicitly designated a different person or entity as the invoicer.
 */
const InvoicerFields: React.FC<{ application: HandlerEmployerApplication }> = ({
  application,
}) => {
  const { t } = useTranslation();

  if (!application.is_separate_invoicer) {
    return null;
  }

  return (
    <>
      <FormSectionHeading
        aria-label={t('common:handlerApplication.invoicer')}
        size="s"
        header={t('common:handlerApplication.invoicer')}
      />
      <Field type="invoicer_name" value={application.invoicer_name || '-'} />
      <Field type="invoicer_email" value={application.invoicer_email || '-'} />
      <Field
        type="invoicer_phone_number"
        value={application.invoicer_phone_number || '-'}
      />
    </>
  );
};

/**
 * Renders additional payment details (payee name, address, SWIFT/BIC code, etc.)
 * which are only populated by the employer if the bank account (IBAN) is a foreign one.
 */
const ForeignPaymentFields: React.FC<{
  application: HandlerEmployerApplication;
}> = ({ application }) => {
  const hasForeignFields =
    application.payee_name ||
    application.payee_address ||
    application.bank_swift_bic_code ||
    application.bank_name ||
    application.bank_address;

  if (!hasForeignFields) {
    return null;
  }

  return (
    <>
      <Field type="payee_name" value={application.payee_name || '-'} />
      <Field type="payee_address" value={application.payee_address || '-'} />
      <Field
        type="bank_swift_bic_code"
        value={application.bank_swift_bic_code || '-'}
      />
      <Field type="bank_name" value={application.bank_name || '-'} />
      <Field type="bank_address" value={application.bank_address || '-'} />
    </>
  );
};

/**
 * Renders the main information section for an employer application, including
 * company details, contact information, invoicing details, payment information,
 * application status, and associated summer voucher details.
 */
const EmployerInfoSection: React.FC<Props> = ({ application, voucher }) => {
  const { t } = useTranslation();

  const companyHeading = `${application.company.name} - ${application.company.business_id}`;

  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        aria-label={companyHeading}
        size="s"
        header={companyHeading}
      />

      <Field type="industry" value={application.company.industry || '-'} />
      <Field
        type="company_form"
        value={application.company.company_form || '-'}
      />
      <Field
        type="company_street_address"
        value={application.company.street_address || '-'}
      />
      <Field
        type="company_postcode"
        value={application.company.postcode || '-'}
      />
      <Field type="city" value={application.company.city || '-'} />

      <FormSectionHeading
        aria-label={t('common:handlerApplication.contact_person')}
        size="s"
        header={t('common:handlerApplication.contact_person')}
      />

      <Field
        type="contact_person_name"
        value={application.contact_person_name || '-'}
      />
      <Field
        type="contact_person_email"
        value={application.contact_person_email || '-'}
      />
      <Field
        type="contact_person_phone_number"
        value={application.contact_person_phone_number || '-'}
      />

      <InvoicerFields application={application} />

      <FormSectionHeading
        aria-label={t('common:handlerApplication.payment')}
        size="s"
        header={t('common:handlerApplication.payment')}
      />

      <Field type="street_address" value={application.street_address || '-'} />
      <Field
        type="bank_account_number"
        value={
          friendlyFormatIBAN(application.bank_account_number) ||
          application.bank_account_number ||
          '-'
        }
      />

      <ForeignPaymentFields application={application} />

      <FormSectionHeading
        aria-label={t('common:handlerApplication.application')}
        size="s"
        header={t('common:handlerApplication.application')}
      />

      <Field
        type="status"
        value={t(
          `common:handlerApplication.applicationStatus.${application.status}`
        )}
      />
      <Field
        type="submitted_at"
        value={
          application.submitted_at
            ? new Date(application.submitted_at).toLocaleDateString('fi-FI')
            : '-'
        }
      />

      <EmployerVoucherSection voucher={voucher} />
    </FormSection>
  );
};

export default EmployerInfoSection;
