import {
  $ViewField,
  $ViewFieldBold,
} from 'benefit/handler/components/applicationForm/ApplicationForm.sc';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ACTIONLESS_STATUSES } from 'benefit/handler/constants';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { ATTACHMENT_TYPES, ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';

import AttachmentsListView from '../../attachmentsListView/AttachmentsListView';

const EmployeeView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      id={data.id}
      header={t(`${translationsBase}.headings.heading5`)}
      section="employee"
      action={!ACTIONLESS_STATUSES.includes(data.status) ? true : null}
    >
      <$GridCell $colSpan={6}>
        <$ViewFieldBold large>
          {getFullName(data.employee?.firstName, data.employee?.lastName)}
        </$ViewFieldBold>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>{t(`${translationsBase}.fields.ssn`)}</$ViewFieldBold>
        <$ViewField>{data.employee?.socialSecurityNumber}</$ViewField>
      </$GridCell>
      <$GridCell $colSpan={6} $colStart={1}>
        <$ViewFieldBold>
          {t(`${translationsBase}.fields.isLivingInHelsinki`)}
        </$ViewFieldBold>
        <$ViewField>
          {t(
            `common:utility.${data.employee?.isLivingInHelsinki ? 'yes' : 'no'}`
          )}
        </$ViewField>
      </$GridCell>
      {data?.company?.organizationType === ORGANIZATION_TYPES.ASSOCIATION && (
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.associationImmediateManagerCheck`)}
          </$ViewFieldBold>
          <$ViewField>
            {t(
              `common:utility.${
                data.associationImmediateManagerCheck ? 'yes' : 'no'
              }`
            )}
          </$ViewField>
        </$GridCell>
      )}
      <$GridCell $colSpan={12} $colStart={1}>
        <AttachmentsListView
          title={t('common:attachments.types.helsinkiBenefitVoucher.title')}
          type={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
          attachments={data.attachments || []}
        />
      </$GridCell>
    </ReviewSection>
  );
};

export default EmployeeView;
