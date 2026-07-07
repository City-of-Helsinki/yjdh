import { HandlerSummerVoucher } from 'kesaseteli/handler/types/HandlerEmployerApplication';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';

import Field, { $DescriptionList } from '../form/Field';

type Props = {
  voucher: HandlerSummerVoucher;
};

const EmployerVoucherAttachments: React.FC<Props> = ({ voucher }) => {
  const { t } = useTranslation();

  const employmentContractFiles = voucher.employment_contract?.length
    ? voucher.employment_contract.map((a) => (
        <div key={`employment-${a.id}`}>{a.attachment_file_name}</div>
      ))
    : '-';
  const payslipFiles = voucher.payslip?.length
    ? voucher.payslip.map((a) => (
        <div key={`payslip-${a.id}`}>{a.attachment_file_name}</div>
      ))
    : '-';

  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="employer-voucher-attachments-heading"
        header={t('common:handlerApplication.attachmentsTitle')}
        as="h4"
      />
      <$DescriptionList aria-labelledby="employer-voucher-attachments-heading">
        <Field type="employment_contract" value={employmentContractFiles} />
        <Field type="payslip" value={payslipFiles} />
      </$DescriptionList>
    </FormSection>
  );
};

export default EmployerVoucherAttachments;
