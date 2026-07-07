import React from 'react';

import type HandlerEmployerApplication from '../../types/HandlerEmployerApplication';
import EmployerApplicationStatusSection from './EmployerApplicationStatusFieldsSection';
import EmployerCompanyFieldsSection from './EmployerCompanyFieldsSection';
import EmployerContactPersonFieldsSection from './EmployerContactPersonFieldsSection';
import EmployerInvoicerFieldsSection from './EmployerInvoicerFieldsSection';
import EmployerPaymentFieldsSection from './EmployerPaymentFieldsSection';

type Props = {
  application: HandlerEmployerApplication;
};

/**
 * Renders the main information section for an employer application, including
 * company details, contact information, invoicing details, payment information,
 * application status, and associated summer voucher details.
 *
 * @deprecated Use sections directly instead.
 */
const EmployerInfoSection: React.FC<Props> = ({ application }) => (
  <>
    <EmployerCompanyFieldsSection application={application} />
    <EmployerContactPersonFieldsSection application={application} />
    <EmployerInvoicerFieldsSection application={application} />
    <EmployerPaymentFieldsSection application={application} />
    <EmployerApplicationStatusSection application={application} />
  </>
);

export default EmployerInfoSection;
