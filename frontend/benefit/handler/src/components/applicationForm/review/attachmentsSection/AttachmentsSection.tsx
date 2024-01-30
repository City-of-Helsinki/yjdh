import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import { ReviewChildProps } from 'benefit/handler/types/common';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { paySubsidyTitle } from 'benefit-shared/utils/common';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import EditButton from '../summarySection/EditButton';
import SummarySection from '../summarySection/SummarySection';

const AttachmentsSection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
  dispatchStep,
}) => {
  const { t } = useTranslation();

  return (
    <SummarySection
      header={t(`${translationsBase}.headings.attachments`)}
      action={
        <EditButton section="attachmentsSection" dispatchStep={dispatchStep} />
      }
    >
      <$GridCell $colStart={1} $colSpan={6}>
        <AttachmentsListView
          type={ATTACHMENT_TYPES.FULL_APPLICATION}
          title={t(
            `${translationsBase}.attachments.types.fullApplication.title`
          )}
          attachments={data.attachments || []}
        />
      </$GridCell>
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
          title={t(paySubsidyTitle(data.paySubsidyGranted))}
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
