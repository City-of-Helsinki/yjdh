import { friendlyFormatIBAN } from 'ibantools';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import Field, { $DescriptionList } from '../form/Field';

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

const EmployerPaymentFieldsSection: React.FC<{
  application: HandlerEmployerApplication;
}> = ({ application }) => {
  const { t } = useTranslation();

  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="employer-payment-heading"
        header={t('common:handlerApplication.payment')}
        as="h4"
      />
      <$DescriptionList aria-labelledby="employer-payment-heading">
        <Field
          type="street_address"
          value={application.street_address || '-'}
        />
        <Field
          type="bank_account_number"
          value={
            friendlyFormatIBAN(application.bank_account_number) ||
            application.bank_account_number ||
            '-'
          }
        />
        <ForeignPaymentFields application={application} />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerPaymentFieldsSection;
