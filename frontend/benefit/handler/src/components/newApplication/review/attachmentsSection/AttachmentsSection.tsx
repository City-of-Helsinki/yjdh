import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import { ReviewChildProps } from 'benefit/handler/types/common';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import SummarySection from '../summarySection/SummarySection';

const AttachmentsSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
}) => {
  const { t } = useTranslation();

  return (
    <SummarySection header={t(`${translationsBase}.headings.attachments`)}>
      <$GridCell $colStart={1} $colSpan={6}>
        <AttachmentsListView
          type={ATTACHMENT_TYPES.FULL_APPLICATION}
          title={t(
            `${translationsBase}.attachments.types.fullApplication.title`
          )}
          attachments={data.attachments || []}
        />
      </$GridCell>
      {(data.benefitType === BENEFIT_TYPES.EMPLOYMENT ||
        data.benefitType === BENEFIT_TYPES.SALARY) && (
        <>
          <$GridCell $colStart={1} $colSpan={6}>
            <AttachmentsListView
              type={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
              title={t(
                `${translationsBase}.attachments.types.employmentContract.title`
              )}
              attachments={data.attachments || []}
            />
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={6}>
            <AttachmentsListView
              type={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
              title={t(
                `${translationsBase}.attachments.types.paySubsidyDecision.title`
              )}
              attachments={data.attachments || []}
            />
          </$GridCell>
          <$GridCell $colStart={1} $colSpan={6}>
            <AttachmentsListView
              type={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
              title={t(
                `${translationsBase}.attachments.types.educationContract.title`
              )}
              attachments={data.attachments || []}
            />
          </$GridCell>
        </>
      )}
      {data.benefitType === BENEFIT_TYPES.COMMISSION && (
        <$GridCell $colStart={1} $colSpan={6}>
          <AttachmentsListView
            type={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
            title={t(
              `${translationsBase}.attachments.types.commissionContract.title`
            )}
            attachments={data.attachments || []}
          />
        </$GridCell>
      )}
      <$GridCell $colStart={1} $colSpan={6}>
        <AttachmentsListView
          type={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
          title={t(
            `${translationsBase}.attachments.types.helsinkiBenefitVoucher.title`
          )}
          attachments={data.attachments || []}
        />
      </$GridCell>
      <$GridCell $colStart={1} $colSpan={6}>
        <AttachmentsListView
          type={ATTACHMENT_TYPES.OTHER_ATTACHMENT}
          title={t(
            `${translationsBase}.attachments.types.otherAttachment.title`
          )}
          attachments={data.attachments || []}
        />
      </$GridCell>
    </SummarySection>
  );
};

export default AttachmentsSection;
